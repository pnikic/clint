import argparse
import json
import random
import sys
import urllib.request
import urllib.parse
import time

playersOutputFile = "chess-results-players.json"

try:
    from bs4 import BeautifulSoup
except ImportError as e:
    print("ERROR: For webpage parsing, the python package Beutiful Soup is used. "\
          "Install it by running:\npip install beautifulsoup4")
    sys.exit(0)


def isChessResultsLink(link):
    return "chess-results.com" in link


def chessResultsLinkModify(link):
    parsed = urllib.parse.urlparse(link)
    queries = []
    if len(parsed.query) > 0:
        queries = parsed.query.split("&")

    queries = chessResultsUrlQueryUpdate(queries, "lan", "1")
    queries = chessResultsUrlQueryUpdate(queries, "zeilen", "99999")
    newQuery = "&".join(queries)
    parsed = parsed._replace(query = newQuery)
    return urllib.parse.urlunparse(parsed)


def chessResultsUrlQueryUpdate(queries, key, value):
    hasQuery = False
    updatedQuery = f"{key}={value}"
    for i, query in enumerate(queries):
        if key in query:
            hasQuery = True
            queries[i] = updatedQuery

    if not hasQuery:
        queries.append(updatedQuery)

    return queries


def chessResultsLinkPlayer(link, startNumber):
    parsed = urllib.parse.urlparse(link)
    queries = []
    if len(parsed.query) > 0:
        queries = parsed.query.split("&")

    queries = chessResultsUrlQueryUpdate(queries, "art", "9")
    queries = chessResultsUrlQueryUpdate(queries, "snr", str(startNumber))
    newQuery = "&".join(queries)
    parsed = parsed._replace(query = newQuery)
    return urllib.parse.urlunparse(parsed)


def chessResultsTableHeader(soup, supportedHeaders):
    supportedTableHeader = lambda t : t and any(t.startswith(header) for header in supportedHeaders)
    header = soup.find_all("h2", string=supportedTableHeader)

    if len(header) != 1:
        allHeaders = list(map(lambda x : f"{x.text}", soup.find_all("h2")))
        print(f"ERROR: Found no header starting with {supportedHeaders}.\n" +
              f"       Available headers: {allHeaders}")
        sys.exit(0)

    return header


def legendSubsetIndices(legendSubset, legendRow):
    # First table row contains the legend (e.g. flag, name, FideID, Rtg, FED etc.)
    for column in legendSubset:
        try:
            legendSubset[column] = next(i for i, v in enumerate(legendRow) if v.text == column)
        except Exception:
            pass

    return legendSubset


def fetchFlagsFromChessResults(link):
    with urllib.request.urlopen(link) as response:
        html = response.read()
        soup = BeautifulSoup(html, "html.parser")
        supportedHeaders = ["Alphabetical list", "Starting rank"]
        header = chessResultsTableHeader(soup, supportedHeaders)
        table = header[0].parent.find("table")
        rows = table.find_all("tr")
        legend = rows[0].find_all("th")
        legendSubset = {"FideID": -1, "FED" : -1, "Name" : -1}
        legendSubset = legendSubsetIndices(legendSubset, legend)

        federationNotFound = legendSubset["FED"] == -1
        playerNotFound = legendSubset["Name"] == -1 and legendSubset["FideID"] == -1
        if federationNotFound or playerNotFound:
            legendColumns = ", ".join(map(lambda x : f"'{x.text}'", legend))
            subsetColumns = ", ".join(f"'{col}'" for col in legendSubset if legendSubset[col] == -1)
            print(f"{subsetColumns} not found in table headers: {legendColumns}")
            sys.exit(0)

        data = {
            "players" : []
        }
        for i in range(1, len(rows)):
            row = rows[i].find_all("td")
            playerEntry = {
                "fide-id" : "0",
                "fed"     : "FID",
                "name"    : "Unnamed player"
            }
            for key in legendSubset:
                index = legendSubset[key]
                mappedKey = attributeNameToJsonKey[key]
                if index != -1 and len(row[index].text) > 0:
                    playerEntry[mappedKey] = row[index].text

            data["players"].append(playerEntry)

        with open(playersOutputFile, 'w') as out:
            json.dump(data, out, ensure_ascii = False)

        outputLines = len(data["players"])
        print(f"{outputLines} players written in file '{playersOutputFile}'")


def fetchPlayersInfoFromChessResults(link):
    with urllib.request.urlopen(link) as response:
        html = response.read()
        soup = BeautifulSoup(html, "html.parser")
        supportedHeaders = ["Alphabetical list", "Starting rank"]
        header = chessResultsTableHeader(soup, supportedHeaders)
        table = header[0].parent.find("table")
        rows = table.find_all("tr")

        data = {
            "players" : []
        }
        for i in range(1, len(rows)):
            # Sleep between requests (up to 500 ms)
            time.sleep(random.randint(0, 500) / 1000)

            playerLink = chessResultsLinkPlayer(link, i)
            print(f"[{i}/{len(rows) - 1}] {playerLink}")
            with urllib.request.urlopen(playerLink) as playerResponse:
                playerHtml = playerResponse.read()
                playerSoup = BeautifulSoup(playerHtml, "html.parser")
                supportedPlayerHeaders = ["Player info"]
                playerHeader = chessResultsTableHeader(playerSoup, supportedPlayerHeaders)
                playerTables = playerHeader[0].parent.find_all("table")
                if len(playerTables) < 2:
                    print(f"ERROR: Missing player table for {playerLink}. Skipping player")
                    continue

                data["players"].append(playerInfo(playerTables))


        with open(playersOutputFile, "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii = False)


attributeNameToJsonKey = {
    "Name"                 : "name",
    "Title"                : "title",
    "Rating international" : "rtg",
    "RtgI"                 : "rtg",
    "Rtg"                  : "rtg",
    "Performance rating"   : "perf-rtg",
    "FIDE rtg +/-"         : "rtg-diff",
    "rtg+/-"               : "rtg-diff",
    "Points"               : "points",
    "Federation"           : "fed",
    "FED"                  : "fed",
    "Fide-ID"              : "fide-id",
    "FideID"               : "fide-id",
    "Year of birth"        : "born",
    "Rd."                  : "rd",
    "Res."                 : "res"
}

def playerInfo(playerTables):
    result = {}
    playerInfoTable = playerTables[0]
    rows = playerInfoTable.find_all("tr")
    for row in rows:
        data = row.find_all("td")
        key = data[0].text
        if key in attributeNameToJsonKey:
            mappedKey = attributeNameToJsonKey[key]
            value = data[1].text
            result[mappedKey] = value

    result["opponents"] = []
    opponentsTable = playerTables[1]
    rows = opponentsTable.find_all("tr", recursive = False) # only direct children
    # Note: there seems to be a mistake that the table header for 'K' is a `td`
    legend = rows[0].find_all(["th", "td"])
    legendSubset = {"Rd.": -1, "FED" : -1, "Name" : -1, "RtgI" : -1, "Rtg" : -1,
                    "Res." : -1, "rtg+/-" : -1}
    legendSubset = legendSubsetIndices(legendSubset, legend)

    for i in range(1, len(rows)):
        row = rows[i].find_all("td", recursive = False) # only direct children
        opponent = {}
        for key in legendSubset:
            index = legendSubset[key]
            if index != -1:
                mappedKey = attributeNameToJsonKey[key]
                opponent[mappedKey] = row[index].text
                if mappedKey == "res":
                    # Result row also contains color of player pieces
                    isBlack = row[index].find("div", {"class" : "FarbesT"})
                    isWhite = row[index].find("div", {"class" : "FarbewT"})
                    color = "b" if isBlack else ""
                    color = "w" if isWhite else color
                    opponent["player-color"] = color

        result["opponents"].append(opponent)

    return result


if __name__ == "__main__":
    exampleLink = "https://chess-results.com/tnr752588.aspx?lan=1"
    parser = argparse.ArgumentParser(
        description="Fetch a chess-results tournament page in order to store information about "\
        f"players. All data is stored in a file named '{playersOutputFile}'.",
        epilog="Examples:\n"\
        f"  python fetch-chess-results.py flag '{exampleLink}'\n"\
        f"  python fetch-chess-results.py full '{exampleLink}'",
        formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument("mode", choices = ["flag", "full"],
                        help="'flag' fetches only one page and stores federations of players, "\
                        "while 'full' fetches a page for each player and stores information "\
                        "about the player and results against all his opponents. The latter "\
                        "might take a few minutes")
    parser.add_argument("url", type=str,
                        help="link to chess-results page with player list, "\
                        "enclosed with quotes ' or \" on both sides")

    try:
        args = parser.parse_args()
    except:
        print("Run with '-h' option to show help text")
        sys.exit(0)

    chessResultsLink = args.url
    print(f"Input link: {chessResultsLink}")
    if not isChessResultsLink(chessResultsLink):
        print(f"ERROR: Link target is not chess-results.com\n")
        parser.print_help()
        sys.exit(0)

    chessResultsLink = chessResultsLinkModify(chessResultsLink)
    print(f"Fetch link: {chessResultsLink}")

    if (args.mode == "flag"):
        fetchFlagsFromChessResults(chessResultsLink)
    elif (args.mode == "full"):
        fetchPlayersInfoFromChessResults(chessResultsLink)

