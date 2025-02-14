#!/usr/bin/env python3
#
# Copyright (c) 2021 Rodent Control
#
#
#            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
#                    Version 2, December 2004
#
# Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
#
# Everyone is permitted to copy and distribute verbatim or modified
# copies of this license document, and changing it is allowed as long
# as the name is changed.
#
#            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
#   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
#
#  0. You just DO WHAT THE FUCK YOU WANT TO.
#

import socket
import select
import time
import itertools
import sys
import secrets
import re
import enum
import html
import ipaddress
import json
import argparse

RESPONSE_TIMEOUT = 1.0
QUERY_RETRIES = 1

COLOR_RESET = '\033[0m'
ARENA_COLORS = {
        '0' : '\033[0;90m',
        '1' : '\033[0;31m',
        '2' : '\033[0;32m',
        '3' : '\033[0;33m',
        '4' : '\033[0;34m',
        '5' : '\033[0;36m',
        '6' : '\033[0;35m',
        '7' : '\033[0;37m',
        '8' : '\033[0;41m',
        }

ARENA_HTML_COLORS = {
        '0' : '000000',
        '1' : 'ff0000',
        '2' : '00ff00',
        '3' : 'ffff00',
        '4' : '0000ff',
        '5' : '00ffff',
        '6' : 'ff00ff',
        '7' : 'ffffff',
        '8' : 'ff6d00',
        }

CHALLENGE_BYTES = 12

CONNECTIONLESS_PREFIX = b"\xff\xff\xff\xff"
RESPONSE_INFO   = b"infoResponse\n"
RESPONSE_STATUS = b"statusResponse\n"
RESPONSE_SERVERS   = b"getserversResponse"
MAX_MSGLEN = 16384

Q3A_PROTOCOL = 71
PORT_MASTER = 27950
PORT_DEFAULT = 27960
PORT_SOURCE_DEFAULT = 27965

OPENARENA_DEFAULT_MASTER = "dpmaster.deathmask.net"


class ServerInfo:
    def __init__(self, ip, port, info, status, players, ping):
        self.ip = ip
        self.port = port
        self.info = info
        self.status = status
        self.players = players
        self.ping = ping

    def saddr(self):
        return "{}:{}".format(self.ip, self.port)


    def _getinfo(self, key):
        return self.info[key.lower()]

    def _getstatus(self, key):
        return self.status[key.lower()]

    def name(self):
        try:
            return ArenaString(self._getinfo(b'hostname'))
        except:
            return ArenaString(b"")

    def _getinfostr(self, key):
        try:
            return printable_string(self._getinfo(key))
        except:
            return ""

    def _getstatustr(self, key):
        try:
            return printable_string(self._getstatus(key))
        except:
            return ""

    def _getinfoi(self, key):
        try:
            n = int(self._getinfo(key))
            return n
        except:
            return 0

    def _getinfou(self, key):
        return max(0, self._getinfoi(key))

    def map(self):
        return self._getinfostr(b'mapname')

    def mod(self):
        mod = self.game()
        if len(mod) == 0:
            mod = self._getstatustr(b'gamename')
            if len(mod) == 0:
                mod = "unknown"
        return mod

    def game(self):
        return self._getinfostr(b'game')

    def gametypenum(self):
        return self._getinfou(b'gametype')

    def gametype(self):
        try:
            gtn = int(self._getinfo(b'gametype'))
            return Gametype(gtn)
        except (ValueError, KeyError):
            return Gametype.UNKNOWN

    def pingstr(self):
        return "{}ms".format(self.ping)

    def num_humans(self):
        return self._getinfou(b'g_humanplayers')

    def num_bots(self):
        return max(0, self.num_clients() - self.num_humans())

    def num_clients(self):
        return self._getinfou(b'clients')

    def maxclients(self):
        return self._getinfou(b'sv_maxclients')

    def is_full(self):
        return self.num_clients() >= self.maxclients()

    def is_pure(self):
        return self._getinfoi(b'pure') != 0

    def is_private(self):
        return self._getinfoi(b'g_needpass') != 0

    def all_players(self):
        return self.players

    def likely_human_players(self):
        expected = self.num_humans()
        players = [p for p in self.players if p.likely_human()]
        if len(players) < expected:
            return self.all_players()
        return players

    def all_info(self):
        return ((printable_string(k), printable_string(v)) for k,v in self.info.items())

    def all_status(self):
        return ((printable_string(k), printable_string(v)) for k,v in self.status.items())

def printable_string(s):
    s = s.decode(encoding='ascii', errors='replace')
    return ''.join((c if c.isprintable() else '\uFFFD' for c in s))

ARENA_CHARMAP = "⏺◢▬◣▌\uFFFD▐◥▀◤▁█\uFFFD▶\uFFFD\uFFFD[]┏━┓▌\uFFFD▐┗━┛\uFFFD┘◄━►"

def _arena_printable_char(c):
    if ord(c) < len(ARENA_CHARMAP):
        c = ARENA_CHARMAP[ord(c)]
    if c.isprintable():
        return c
    return '\uFFFD'

def _arena_printable_string(s):
    s = s.decode(encoding='ascii', errors='replace')
    return ''.join((_arena_printable_char(c) for c in s))

def termcolor(match):
    try:
        return ARENA_COLORS[match.group(0).lstrip('^')]
    except:
        return match.group(0)


def _html_fonttag(color):
    return '<font color="#{}">'.format(color)

class ArenaString:
    def __init__(self, s):
        self.s = _arena_printable_string(s)

    def strip(self):
        stripped = ArenaString(b"")
        stripped.s = self.s.strip()
        return stripped

    def normalize(self):
        normalized = self.strip()
        # remove color, collapse spaces
        normalized.s = re.sub(r"\s+", " ", normalized.getstr(color=False))
        return normalized

    def getstr(self, color=False):
        pat = r"\^[0-8]"
        if color:
            return ARENA_COLORS['7'] + re.sub(pat, termcolor, self.s) + COLOR_RESET
        return re.sub(pat, "", self.s)

    def gethtml(self, palette=ARENA_HTML_COLORS):
        res = []
        pat = r"\^[0-8]"
        lastidx = 0
        res.append(_html_fonttag(palette['7']))
        for match in re.finditer(pat, self.s):
            cs = match.group(0).lstrip('^')
            if cs not in palette:
                continue
            p = self.s[lastidx:match.start()]
            res.append(html.escape(p))
            lastidx = match.end()
            res.append('</font>')
            res.append(_html_fonttag(palette[cs]))
        p = self.s[lastidx:]
        res.append(html.escape(p))
        res.append('</font>')
        return ''.join(res)

    def tag_str_pairs(self):
        """Iterator over (colortag, s) pairs"""

        pat = r'(\^[0-8])'
        s = "^7" + self.s
        lst = re.split(pat, s)
        for (tag, fragment) in zip(itertools.islice(lst, 1, None, 2),
                                   itertools.islice(lst, 2, None, 2)):
            yield (tag.lstrip('^'), fragment)

    def tag_str_dicts(self):
        return [
                {
                 'colortag': tag,
                 'text': s
                }
                for (tag, s) in self.tag_str_pairs()
            ]

class Player:
    def __init__(self, name, score=0, ping=0):
        self.name = ArenaString(name)
        self.score = score
        self.ping = ping

    def likely_human(self):
        return self.ping != 0

def player_from_str(s):
    try:
        fields = s.split(b" ", maxsplit=2)
        score = int(fields[0])
        ping = int(fields[1])
        name = fields[2][1:-1]
        return Player(name, score, ping)
    except:
        return None

@enum.unique
class Gametype(enum.IntEnum):
    FFA             = 0
    TOURNAMENT      = 1
    SINGLE_PLAYER   = 2
    TEAM            = 3
    CTF             = 4
    ONEFCTF         = 5
    OBELISK         = 6
    HARVESTER       = 7
    ELIMINATION     = 8
    CTF_ELIMINATION = 9
    LMS             = 10
    DOUBLE_D        = 11
    DOMINATION      = 12
    TREASURE_HUNTER = 13
    MULTITOURNAMENT = 14
    UNKNOWN         = -1

    def __str__(self):
        if self == Gametype.FFA:
            return "Free For All"
        if self == Gametype.SINGLE_PLAYER:
            return "Single Player"
        if self == Gametype.TOURNAMENT:
            return "Tournament"
        if self == Gametype.TEAM:
            return "Team Deathmatch"
        if self == Gametype.CTF:
            return "Capture The Flag"
        if self == Gametype.ONEFCTF:
            return "One Flag CTF"
        if self == Gametype.OBELISK:
            return "Overload"
        if self == Gametype.HARVESTER:
            return "Harvester"
        if self == Gametype.ELIMINATION:
            return "Elimination"
        if self == Gametype.CTF_ELIMINATION:
            return "CTF Elimination"
        if self == Gametype.LMS:
            return "Last Man Standing"
        if self == Gametype.DOUBLE_D:
            return "Double Domination"
        if self == Gametype.DOMINATION:
            return "Domination"
        if self == Gametype.TREASURE_HUNTER:
            return "Treasure Hunter"
        if self == Gametype.MULTITOURNAMENT:
            return "Multitournament"

        return "Unknown Gametype"

    @staticmethod
    def from_str(s):
        try:
            return Gametype(int(s))
        except ValueError:
            pass

        s = s.lower()
        for name, member in Gametype.__members__.items():
            if name.lower() == s or str(member).lower() == s:
                return member

        raise ArenaError("unknown gametype {}".format(s))

    @staticmethod
    def set_from_strs(gts_list):
        gt_set = set()
        for gts in gts_list:
            gt = Gametype.from_str(gts)
            if gt == Gametype.TOURNAMENT:
                gt_set.add(Gametype.MULTITOURNAMENT)
            elif gt == Gametype.UNKNOWN:
                continue
            gt_set.add(gt)
        return gt_set

    @staticmethod
    def printall():
        for name, member in Gametype.__members__.items():
            if member == Gametype.UNKNOWN:
                continue
            print(f"{int(member)}: {name} ({str(member)})")



def create_socket(random_port=False):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    if random_port:
        return sock
    for localport in range(PORT_SOURCE_DEFAULT, PORT_SOURCE_DEFAULT + 10):
        try:
            sock.bind(('', localport))
            return sock
        except OSError as e:
            continue
    print("error binding local socket, using random source port", file=sys.stderr)
    return sock

class QueryDispatcher:
    def __init__(self, socket):
        self.queries = {}
        self._socket = socket

    def clear(self):
        self.queries.clear()

    def insert(self, query):
        self.queries[query.addr()] = query

    def server_queries(self):
        return [q for q in self.queries.values() if isinstance(q, ServerQuery)]

    def master_queries(self):
        return [q for q in self.queries.values() if isinstance(q, MasterQuery)]

    def getinfo(self):
        for query in self.server_queries():
            query.send_getinfo(self._socket)

    def getstatus(self):
        for query in self.server_queries():
            query.send_getstatus(self._socket)

    def getservers(self):
        for query in self.master_queries():
            query.send_getservers(self._socket)

    def pending(self):
        return any((q.pending() for q in self.queries.values()))

    def retry(self):
        for query in self.queries.values():
            query.retry(self._socket)

    def recv(self, timeout=RESPONSE_TIMEOUT):
        self._socket.setblocking(False)
        late = time.monotonic() + timeout
        while self.pending():
            timeout = late - time.monotonic()
            if timeout <= 0:
                print("Warning: timed out waiting for response(s)", file=sys.stderr)
                return False
            (r, _, _) = select.select([self._socket], [], [], timeout)
            if not len(r):
                continue
            try:
                (data, raddr) = self._socket.recvfrom(MAX_MSGLEN)
            except BlockingIOError as e:
                continue
            except OSError as e:
                print("Socket error: {}".format(e), file=sys.stderr)
                continue

            if raddr not in self.queries:
                continue

            try:
                self.queries[raddr].parse_response(data)
            except ArenaError as e:
                print("Error when parsing packet from {}: {}".format(raddr, e), file=sys.stderr)
        return True

    def collect_server(self):
        l = [q.build_info() for q in self.server_queries()]
        return [info for info in l if info]

    def collect(self):
        return self.collect_server()

    def collect_master(self):
        servers = set()
        l = [q.servers() for q in self.master_queries()]
        for addrs in l:
            if addrs is None:
                continue
            servers.update(addrs)
        return servers


def _parse_infostring(s):
    delim = b'\\'
    if s.startswith(delim):
        s = s[len(delim):]
    tokens = s.split(delim)
    return dict(
            zip((k.lower() for k in itertools.islice(tokens,0,None,2)),
                itertools.islice(tokens,1,None,2))
            )

def _generate_challenge(sz=CHALLENGE_BYTES):
    return secrets.token_urlsafe(sz).encode()

class Query:
    def __init__(self, ip, port):
        self.ip = ip
        self.port = port

    def pending(self):
        return False

    def retry(self):
        pass

    def parse_response(self, data):
        pass

    def addr(self):
        return (self.ip, self.port)

    def _send_request(self, request, sock):
        sock.setblocking(True)
        sock.sendto(CONNECTIONLESS_PREFIX + request, (self.ip, self.port))

class ServerQuery(Query):
    def __init__(self, ip, port):
        super().__init__(ip, port)

        self._info = None
        self._statusinfo = None
        self._players = None

        self.reset()

    def build_info(self):
        if (self._info is None
                or self._statusinfo is None
                or self._players is None
                or self._ping is None):
            return None
        return ServerInfo(self.ip, self.port, self._info, self._statusinfo, self._players,
                self._ping)

    def reset(self):
        self._challenges_info = {}
        self._challenges_status = {}
        self._ping = None

    def pending_info(self):
        return len(self._challenges_info) > 0

    def pending_status(self):
        return len(self._challenges_status) > 0

    def pending(self):
        return self.pending_info() or self.pending_status()

    def _store_challenge(self, challenges):
        challenge = _generate_challenge()
        challenges[challenge] = time.monotonic()
        return challenge


    def send_getinfo(self, sock):
        challenge = self._store_challenge(self._challenges_info)
        request = b"".join((b"getinfo ", challenge, b"\n"))
        self._send_request(request, sock)

    def send_getstatus(self, sock):
        challenge = self._store_challenge(self._challenges_status)
        request = b"".join((b"getstatus ", challenge, b"\n"))
        self._send_request(request, sock)

    def retry(self, sock):
        if self.pending_info():
            self.send_getinfo(sock)
        if self.pending_status():
            self.send_getstatus(sock)

    def parse_response(self, data):
        if not data.startswith(CONNECTIONLESS_PREFIX):
            raise ArenaError("invalid connectionless packet")

        data = data[len(CONNECTIONLESS_PREFIX):]

        if data.lower().startswith(RESPONSE_INFO.lower()):
            return self._parse_inforesponse(data[len(RESPONSE_INFO):])
        elif data.lower().startswith(RESPONSE_STATUS.lower()):
            return self._parse_statusresponse(data[len(RESPONSE_STATUS):])

        raise ArenaError("unknown packet type")

    def _verify_challengeresponse(self, challenges, response_info):
        if b"challenge" not in response_info:
            raise ArenaError("missing challenge in response")
        challengeresponse = response_info[b"challenge"]
        try:
            sent_time = challenges[challengeresponse]
        except KeyError:
            raise ArenaError("invalid challenge response")
        else:
            # valid challenge
            ping = round((time.monotonic() - sent_time) * 1000)
            if self._ping is None:
                self._ping = ping
            else:
                self._ping = min(ping, self._ping)

        del response_info[b'challenge']

        return response_info


    def _parse_inforesponse(self, data):
        info = _parse_infostring(data)
        self._info = self._verify_challengeresponse(self._challenges_info, info)
        self._challenges_info = {}

    def _parse_statusresponse(self, data):
        lines = data.split(b"\n")
        info = _parse_infostring(lines[0])
        self._statusinfo = self._verify_challengeresponse(self._challenges_status, info)
        self._challenges_status = {}
        if len(lines) >= 2:
            self._players = [p for p in [player_from_str(s) for s in lines[1:-1]] if p]
        else:
            self._players = []

class MasterQuery(Query):
    def __init__(self, ip, port, empty=True):
        super().__init__(ip, port)

        self.empty = empty
        self.reset()

    def reset(self):
        self._pending = False
        self._servers = None

    def pending(self):
        return self._pending

    def _send_request(self, request, sock):
        super()._send_request(request, sock)
        self._pending = True

    def send_getservers(self, sock):
        request = b"".join((b"getservers ", f"{Q3A_PROTOCOL}".encode(),
            b" empty" if self.empty else b"",
            b" full"))
        self._send_request(request, sock)

    def retry(self, sock):
        if self.pending():
            self.reset()
            self.send_getservers(sock)

    def parse_response(self, data):
        if not data.startswith(CONNECTIONLESS_PREFIX):
            raise ArenaError("invalid master packet")

        data = data[len(CONNECTIONLESS_PREFIX):]

        if data.lower().startswith(RESPONSE_SERVERS.lower()):
            return self._parse_serversresponse(data[len(RESPONSE_SERVERS):])

        raise ArenaError("unknown master packet type")

    def _parse_serversresponse(self, data):
        servers = _parse_infostring(data)
        addrs = set()
        elem_size = 7
        for ipport in (data[i:i+elem_size] for i in range(0, len(data), elem_size)):
            ipport = ipport[1:]
            if ipport == b"EOT\0\0\0":
                # last packet from master
                self._pending = False
                break
            if len(ipport) != 6:
                self._pending = False
                raise ArenaError("invalid address format in getserversResponse")
            ip = socket.inet_ntop(socket.AF_INET, ipport[:4])
            port = int.from_bytes(ipport[4:], byteorder='big')
            addrs.add((ip, port))

        if self._servers is None:
            self._servers = addrs
        else:
            self._servers.update(addrs)

    def servers(self):
        return self._servers

class ArenaError(Exception):
    def __init__(self, message):
        self.message = message
        
def query_master(addrs, timeout=RESPONSE_TIMEOUT, retries=QUERY_RETRIES, empty=True, random_sport=False):
    with create_socket(random_sport) as sock:
        dispatcher = QueryDispatcher(sock)
        for (ip, port) in addrs:
            dispatcher.insert(MasterQuery(ip, port, empty))

        dispatcher.getservers()
        while not dispatcher.recv(timeout) and retries > 0:
            retries -= 1
            dispatcher.retry()

        for query in dispatcher.master_queries():
            if query.pending():
                print("Warning: did not receive a valid getservers response from master {}".format(query.addr()), file=sys.stderr)

        return dispatcher.collect_master()

def print_addrs(addrs, sort=False):
    if sort:
        addrs = sorted(addrs)
    for (ip, port) in addrs:
        print(f"{ip}:{port}")

def filter_addrs(addrs, exclude_ips, include_ips):
    try:
        exclude_ips = set((ipaddress.IPv4Address(ip) for ip in exclude_ips))
        include_ips = set((ipaddress.IPv4Address(ip) for ip in include_ips))
    except ipaddress.AddressValueError as e:
        print(f"Error: invalid IP address: {e}", file=sys.stderr)
        sys.exit(1)

    addrs_filtered = []
    for (ip, port) in addrs:
        try:
            ip = ipaddress.IPv4Address(ip)
        except ipaddress.AddressValueError as e:
            print(f"Warning: invalid IP address, ignoring: {e}", file=sys.stderr)
            continue
        if ip in exclude_ips:
            continue
        if len(include_ips) > 0:
            if ip not in include_ips:
                continue
        addrs_filtered.append((str(ip), port))
    return addrs_filtered

def query_servers(addrs, timeout=RESPONSE_TIMEOUT, retries=QUERY_RETRIES, random_sport=False):
    with create_socket(random_sport) as sock:
        dispatcher = QueryDispatcher(sock)
        for (ip, port) in addrs:
            dispatcher.insert(ServerQuery(ip, port))

        dispatcher.getinfo()
        dispatcher.getstatus()
        while not dispatcher.recv(timeout) and retries > 0:
            retries -= 1
            dispatcher.retry()

        for query in dispatcher.server_queries():
            if query.pending_info():
                print("Warning: did not receive a valid info response from {}".format(query.addr()), file=sys.stderr)
            if query.pending_status():
                print("Warning: did not receive a valid status response from {}".format(query.addr()), file=sys.stderr)

        return dispatcher.collect()

def pretty_print(serverinfos, show_empty=False, colors=False, bots=False, sort=False,
        gametype_filter=None, mod=False, mods_filter=None, dump=False, ping=False):
    if mods_filter is not None:
        mods_filter = set(mods_filter)
    if sort:
        serverinfos = sorted(serverinfos, key=lambda x: x.num_humans(), reverse=True)
    first = True
    for info in serverinfos:
        if not (show_empty or info.num_humans()):
            continue
        if gametype_filter is not None and info.gametype() not in gametype_filter:
            continue
        if mods_filter is not None and info.mod() not in mods_filter:
            continue

        if first:
            first = False
        else:
            print("")

        just = 21
        fields = []
        fields.append(info.saddr().rjust(just))
        fields.append(info.name().strip().getstr(colors))

        print(' '.join(fields))

        if mod:
            fields = []
            fields.append('Mod:'.rjust(just))
            fields.append(str(info.mod()))
            print(' '.join(fields))

        fields = []
        fields.append('Gametype:'.rjust(just))
        fields.append(str(info.gametype()))
        print(' '.join(fields))

        fields = []
        fields.append('Map:'.rjust(just))
        fields.append(info.map())
        print(' '.join(fields))

        if ping:
            fields = []
            fields.append('Ping:'.rjust(just))
            fields.append(info.pingstr())
            print(' '.join(fields))

        fields = []
        fields.append('Players:'.rjust(just))
        nplayers = info.num_humans()
        maxclients = info.maxclients()
        cformat = ""
        creset = ""
        if (colors):
            creset = COLOR_RESET
            if nplayers >= maxclients or info.is_full():
                cformat = ARENA_COLORS['1']
            elif nplayers >= maxclients/4 * 3:
                cformat = ARENA_COLORS['3']
            elif nplayers > 0:
                cformat = ARENA_COLORS['2']

        fields.append('{}{}/{}{}'.format(cformat, nplayers, maxclients, creset))
        print(' '.join(fields))
        players = info.all_players() if bots else info.likely_human_players()
        if sort:
            players = sorted(players, key=lambda p: p.score, reverse=True)
        for p in players:
            fields = []
            fields.append(''.rjust(just))
            fields.append("{:4}".format(p.score))
            fields.append("{:4}ms".format(p.ping))
            fields.append(p.name.getstr(colors))
            print(' '.join(fields))

        if dump:
            print('Info Variables:'.rjust(just))
            for k,v in info.all_info():
                print(" " * just + " {} {}".format(repr(k), repr(v)))
            print('Status Variables:'.rjust(just))
            for k,v in info.all_status():
                print(" " * just + " {} {}".format(repr(k), repr(v)))


def players_print(serverinfos, colors=False, bots=False,
        gametype_filter=None, mods_filter=None):
    if mods_filter is not None:
        mods_filter = set(mods_filter)
    serverinfos = sorted(serverinfos, key=lambda x: x.num_humans(), reverse=True)
    for info in serverinfos:
        if gametype_filter is not None and info.gametype() not in gametype_filter:
            continue
        if mods_filter is not None and info.mod() not in mods_filter:
            continue

        players = info.all_players() if bots else info.likely_human_players()
        players = sorted(players, key=lambda p: p.score, reverse=True)
        for p in players:
            fields = []
            fields.append(p.name.getstr(colors) + ' '*(30-len(p.name.getstr(False))))
            fields.append(info.saddr().ljust(21))
            fields.append(info.name().strip().getstr(colors))
            print(' '.join(fields))

def json_print(serverinfos, pretty=True):
    jsondata = {
            'servers': []
            }
    serverinfos = sorted(serverinfos, key=lambda x: x.num_humans(), reverse=True)
    for info in serverinfos:
        jsonserver = {
                'address': info.saddr(),
                'clean_name': info.name().strip().getstr(color=False),
                'parsed_name': info.name().strip().tag_str_dicts(),
                'gametype': {
                    'str': str(info.gametype()),
                    'num': info.gametypenum(),
                    },
                'map': info.map(),
                'ping': info.ping,
                'players': [],
                }
        players = sorted(info.all_players(), key=lambda p: p.score, reverse=True)
        for p in players:
            jsonserver['players'].append(
                {
                    'clean_name': p.name.strip().getstr(color=False),
                    'parsed_name': p.name.strip().tag_str_dicts(),
                    'score': p.score,
                    'ping': p.ping,
                    'likely_human': p.likely_human(),
                }
                )

        jsondata['servers'].append(jsonserver)

    if pretty:
        print(json.dumps(jsondata, indent=4))
    else:
        print(json.dumps(jsondata))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Query OpenArena servers.')
    parser.add_argument('servers', metavar='HOST:PORT', nargs='*', help='servers to query.\
            If --master or --all is used, these will be interpreted to be master servers.')
    parser.add_argument('--list-gametypes', action='store_true', help='list all known gametypes')
    parser.add_argument('-m', '--master', action='store_true', help='query master servers instead of game servers. \
            If no master server is specified, {} will be used by default'.format(OPENARENA_DEFAULT_MASTER))
    parser.add_argument('-a', '--all', action='store_true', help='query all the game servers a master returns. \
            If no master server is specified, {} will be used by default'.format(OPENARENA_DEFAULT_MASTER))
    parser.add_argument('--no-colors', action='store_true', help='disable color output')
    parser.add_argument('-c', '--colors', action='store_true', help='force color output')
    parser.add_argument('-e', '--empty', action='store_true', help='show empty servers')
    parser.add_argument('-b', '--bots', action='store_true', help='show bots')
    parser.add_argument('-s', '--sort', action='store_true', help='enable sorting')
    parser.add_argument('-P', '--ping', action='store_true', help='show server ping')
    parser.add_argument('-p', '--players', action='store_true', help='list players instead of servers')
    parser.add_argument('-M', '--mod', action='store_true', help='show mod')
    parser.add_argument('--filter-mods', metavar='MOD', nargs='+', help='filter mods')
    parser.add_argument('-g', '--gametypes', metavar='GT', nargs='+', help='filter servers by gametypes. \
            Gametypes can be specified numerically or by name (see --list-gametypes)')
    parser.add_argument('--ip-include', metavar='IP', nargs='+', default=[],
            help='Only query game servers with specific IPs (use together with -a)')
    parser.add_argument('--ip-exclude', metavar='IP', nargs='+', default=[],
            help='Do not query specific game server IPs (use together with -a)')
    parser.add_argument('--timeout', metavar='SECONDS', type=float, default=RESPONSE_TIMEOUT, help='timeout, in seconds')
    parser.add_argument('--retries', type=int, default=QUERY_RETRIES, help='number of retries')
    parser.add_argument('--json', action='store_true',
            help='produce JSON output. Output filtering/formatting options (--filter-mods, --players, etc.) will be ignored.')
    parser.add_argument('--json-pretty', action='store_true', help='Make JSON output pretty.')
    parser.add_argument('--dump', action='store_true', help='dump complete list of info/status response variables')
    parser.add_argument('--random-sport', action='store_true', default=False, help='use a random source port by default')
    args = parser.parse_args()

    if args.list_gametypes:
        Gametype.printall()
        sys.exit(0)

    if args.gametypes is not None:
        try:
            gametype_filter = Gametype.set_from_strs(args.gametypes)
        except ArenaError as e:
            print("Failed to parse gametype: {}".format(e), file=sys.stderr)
            sys.exit(1)
        if len(gametype_filter) == 0:
            print("empty gametype list!", file=sys.stderr)
            sys.exit(1)
    else:
        gametype_filter = None

    query_addresses = args.servers
    if len(query_addresses) == 0:
        if args.all or args.master:
            query_addresses = [OPENARENA_DEFAULT_MASTER]
        else:
            parser.error("error: the following arguments are required: HOST:PORT")

    addrs = []
    for srv in query_addresses:
        try:
            l = srv.split(':')
            ip = l[0]
            if len(l) > 1:
                port = int(l[1])
            elif args.master or args.all:
                port = PORT_MASTER
            else:
                port = PORT_DEFAULT
            raddr = (socket.gethostbyname(ip), port)
            addrs.append(raddr)
        except socket.gaierror as e:
            print("Failed to resolve host: {}".format(e), file=sys.stderr)
            sys.exit(2)
        except:
            print("invalid server address {}".format(srv), file=sys.stderr)
            sys.exit(1)

    if args.timeout <= 0:
        print("invalid timeout {}".format(args.timeout), file=sys.stderr)
        sys.exit(1)

    if args.retries < 0:
        print("invalid retries {}".format(args.retries), file=sys.stderr)
        sys.exit(1)

    if args.all or args.master:
        server_addresses = query_master(addrs, args.timeout, args.retries, args.empty, args.random_sport)
        if not args.all:
            print_addrs(server_addresses, args.sort)
            sys.exit(0)
    else:
        server_addresses = addrs

    server_addresses = filter_addrs(server_addresses, args.ip_exclude, args.ip_include)

    server_infos = query_servers(server_addresses, args.timeout, args.retries, args.random_sport)

    if args.json:
        json_print(server_infos, args.json_pretty)
        sys.exit(0)


    colors = not args.no_colors and (args.colors or sys.stdout.isatty())

    if args.players:
        players_print(server_infos, colors, args.bots,
                gametype_filter, args.filter_mods)
        sys.exit(0)

    pretty_print(server_infos, args.empty, colors, args.bots, args.sort,
            gametype_filter, args.mod, args.filter_mods, args.dump, args.ping)

    sys.exit(0)

