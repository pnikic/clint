import base64
import json
import random
import sys
import urllib.request
import time

try:
    from bs4 import BeautifulSoup
except ImportError as e:
    print("ERROR: For webpage parsing, the python package Beutiful Soup is used. "\
          "Install it by running:\npip install beautifulsoup4")
    sys.exit(0)

try:
    import filetype
except ImportError as e:
    print("ERROR: For detecting type of fide images, the python package filetype used. "\
          "Install it by running:\npip install filetype")
    sys.exit(0)


playersInputFile = "chess-results-players.json"
fideProfileUrl = "https://ratings.fide.com/profile/"

def fetchImage(fideId):
    link = fideProfileUrl + fideId
    try:
        with urllib.request.urlopen(link) as response:
            html = response.read()
            soup = BeautifulSoup(html, "html.parser")
            # Parsing aligned with current design of FIDE webpage. Current image format:
            # <img class="profile-top__photo" src="data:image/jpeg;base64,<base64-encoded-image>">
            img = soup.find("img", {"class" : "profile-top__photo"}).get("src")
            prefix = "base64,"
            begin = img.find(prefix) + len(prefix)
            base64EncodedImg = img[begin:]
            decodedImg = base64.b64decode(base64EncodedImg)
            extension = filetype.guess(decodedImg).extension
            if extension == "gif":
                print(f"INFO: Image extension is 'gif'. Player doesn't have an image.")
            elif extension is not None:
                storedImagePath = f"players/{fideId}.{extension}"
                with open(storedImagePath, "wb") as fd:
                    fd.write(decodedImg)
                    print(f"Image stored in {storedImagePath}")
            else:
                print(f"ERROR: Image extension not found. Skipping player {link}")
    except Exception as e:
        print("Exception", e)
        print(f"ERROR: Skipping player {link}")


def fetchFideImages():
    try:
        with open(playersInputFile) as inp:
            data = json.load(inp)
            if "players" not in data:
                print("ERROR: Missing 'players' in JSON file. Fetch data from chess-results first")
                sys.exit(0)

            numRows = len(data["players"])
            for i in range(numRows):
                # Sleep between requests (up to 500 ms)
                time.sleep(random.randint(0, 500) / 1000)

                row = data["players"][i]
                playerName = row["name"]
                playerLink = fideProfileUrl + row["fide-id"]
                print(f"[{i + 1}/{numRows}] {playerName} {playerLink}")
                fetchImage(row["fide-id"])

    except FileNotFoundError as e:
        print(f"ERROR: File '{playersInputFile}' not found. You can try:\n"
              "- change directory to 'scripts' folder, and\n"
              "- fetch data from chess-results")
        print(f"Cause: {e}")
        sys.exit(0)
    except json.decoder.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON file")
        print(f"Cause: {e}")
        sys.exit(0)
    except KeyError as e:
        print(f"ERROR: Missing key in JSON file.")
        print(f"Cause: {e}")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR: Other exception")
        print(f"Cause: {e}")
        sys.exit(0)


if __name__ == "__main__":
    fetchFideImages()
