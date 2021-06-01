import ndjson
import json
import requests
import pandas as pd
import numpy as np

def fetchData():
    r = requests.get("https://vrs-data.cio.go.jp/vaccination/opendata/latest/prefecture.ndjson")

    parsed_r = r.json(cls=ndjson.Decoder)

    df = pd.DataFrame.from_records(parsed_r)
    return df
