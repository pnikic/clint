import argparse
import sys
import urllib.request
import urllib.parse

try:
    from bs4 import BeautifulSoup
except ImportError as e:
    print("ERROR: For webpage parsing, the python package Beutiful Soup is used. "\
          "Install it by running:\npip install beautifulsoup4")
    sys.exit(1)


def isChessResultsLink(link):
    return "chess-results.com" in link


def chessResultsLinkModify(link):
    parsed = urllib.parse.urlparse(link)
    queries = []
    if len(parsed.query) > 0:
        queries = parsed.query.split("&")

    queries = chessResultsUrlQueryToEnglish(queries)
    queries = chessResultsUrlQueryToShowCompleteList(queries)
    newQuery = "&".join(queries)
    parsed = parsed._replace(query = newQuery)
    return urllib.parse.urlunparse(parsed)


def chessResultsUrlQueryToEnglish(queries):
    hasLanguageQuery = False
    language = "lan"
    englishLanguage = f"{language}=1"
    for i, query in enumerate(queries):
        if language in query:
            hasLanguageQuery = True
            queries[i] = englishLanguage

    if not hasLanguageQuery:
        queries.append(englishLanguage)

    return queries


def chessResultsUrlQueryToShowCompleteList(queries):
    hasRowsQuery = False
    rows = "zeilen"
    showCompleteList = f"{rows}=99999"
    for i, query in enumerate(queries):
        if rows in query:
            hasRowsQuery = True
            queries[i] = showCompleteList

    if not hasRowsQuery:
        queries.append(showCompleteList)

    return queries


def fetchFlagsFromChessResults(link):
    with urllib.request.urlopen(link) as response:
        html = response.read()
        soup = BeautifulSoup(html, "html.parser")
        headerText = [
            "Alphabetical list",
            "Starting rank",                 # Swiss individual
            "Starting rank list of players", # Round robin individual
        ]
        header = []
        it = 0
        while len(header) != 1 and it < len(headerText):
            header = soup.find_all("h2", text=headerText[it])
            it += 1

        if len(header) != 1:
            allHeaders = list(map(lambda x : f"{x.text}", soup.find_all("h2")))
            print(f"ERROR: Found no header from {headerText}.\n" +
                  f"       Available headers: {allHeaders}")
            sys.exit(1)

        table = header[0].parent.find("table")
        # First row contains the legend (e.g. No, flag, name, FideID, FED etc.)
        rows = table.find_all("tr")
        legend = rows[0].find_all("th")
        try:
            nameIndex = next(i for i, v in enumerate(legend) if v.text == "Name")
            fideIdIndex = next(i for i, v in enumerate(legend) if v.text == "FideID")
            fedIndex = next(i for i, v in enumerate(legend) if v.text == "FED")
        except Exception as e:
            legendColumns = ", ".join(map(lambda x : f"'{x.text}'", legend))
            print(f"'Name', 'FideID' or 'FED' not found in table headers: {legendColumns}")
            sys.exit(1)

        outputLines = 0
        with open(outputFile, 'w') as out:
            for i in range(1, len(rows)):
                row = rows[i].find_all("td")
                name = row[nameIndex].text
                fideId = row[fideIdIndex].text
                federation = row[fedIndex].text

                if len(fideId) == 0:
                    fideId = "0"

                out.write(f"{fideId} {federation} {name}\n")
                outputLines += 1

        print(f"{outputLines} players written in file '{outputFile}'")


if __name__ == "__main__":
    outputFile = "chess-results-flags"
    exampleLink = "https://chess-results.com/tnr752588.aspx?lan=1"
    parser = argparse.ArgumentParser(
        description="Fetch a chess-results tournament page in order to store information about  "\
        "players: federation, Fide ID and name. All data is stored in a file named "\
        f"'{outputFile}'.",
        epilog=f"Example: python flags-from-chess-results.py '{exampleLink}'")
    parser.add_argument("url", type=str,
                        help="link to chess-results page with player list, "\
                        "enclosed with quotes ' or \" on both sides")

    args = parser.parse_args()
    chessResultsLink = args.url
    print(f"Input link: {chessResultsLink}")
    if not isChessResultsLink(chessResultsLink):
        print(f"ERROR: Link target is not chess-results.com\n")
        parser.print_help()
        sys.exit(1)

    chessResultsLink = chessResultsLinkModify(chessResultsLink)
    print(f"Fetch link: {chessResultsLink}")
    fetchFlagsFromChessResults(chessResultsLink)

