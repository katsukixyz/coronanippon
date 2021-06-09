import ndjson
import json
import requests
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.types import String, Integer, Date, Boolean
import time

def fetchVaccines():
    r = requests.get("https://vrs-data.cio.go.jp/vaccination/opendata/latest/prefecture.ndjson")

    parsed_r = r.json(cls=ndjson.Decoder)

    df = pd.DataFrame.from_records(parsed_r)
    df['prefecture'] = [int(x) for x in df['prefecture']]

    return df

def fetchPref():
    pref = pd.read_excel('000701583.xls', header = 1)
    pref = pref.loc[(pref['団体コード'].notnull()) & (pref['市区町村名'].isnull()) & (pref['性別'] == '計')]
    pref = pref.reset_index(drop = True).reset_index()
    final = pref[['index', '都道府県名', '総数']]
    final['都道府県名'] = final['都道府県名'].str.replace('*', "", regex = False)
    final["index"] = final["index"].apply(lambda x: x+1)
    final = final.rename(columns = {"index": "id", "都道府県名": "name", "総数": "population"})
    
    return final

if __name__ == '__main__':
    alchemyEngine = create_engine('postgresql+psycopg2://root:root@db:5432/coronanippon_db', pool_recycle=3600)
    dbConnection = alchemyEngine.connect()

    pref = fetchPref()
    try:
        pref.to_sql('prefectures', con = dbConnection, index = False, if_exists = 'fail', dtype = {"id": Integer(), "name": String(), "population": Integer()})
    except:
        print("Database already exists. Skipping 'prefectures' table creation.")

    starttime = time.time()

    while True:
        vacc = fetchVaccines()
        vacc.to_sql('vaccines', con = dbConnection, index = False, if_exists = 'replace', dtype = {"date": Date(), "prefecture": Integer(), "gender": String(), "age": String(), "medical_worker": Boolean(), "status": Integer(), "count": Integer()})
        time.sleep(3600 - (time.time() - starttime) % 3600)

