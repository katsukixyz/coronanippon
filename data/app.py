import ndjson
import json
import requests
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.types import String, Integer, Date, Boolean
import time
import os
from dotenv import load_dotenv


def fetchVaccines():
    url = "https://vrs-data.cio.go.jp/vaccination/opendata/latest/prefecture.ndjson"
    r = requests.get(url)

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
    load_dotenv()

    if os.environ['DATABASE_URL']:
        connection_str = os.environ['DATABASE_URL']
    else:
        env_list = ['DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_HOST', 'DB_PORT']
        env_dict = {x.split('DB_')[1]: os.getenv(x) for x in env_list}
        connection_str = os.getenv(f"postgresql+psycopg2://{env_dict['USER']}:{env_dict['PASSWORD']}@{env_dict['HOST']}:{env_dict['PORT']}/{env_dict['DATABASE']}")

    # alchemyEngine = create_engine('postgresql+psycopg2://root:root@db:5432/coronanippon_db', pool_recycle=3600)
    alchemyEngine = create_engine(connection_str)
    dbConnection = alchemyEngine.connect()

    pref = fetchPref()
    try:
        pref.to_sql('prefectures', con = dbConnection, index = False, if_exists = 'fail', dtype = {"id": Integer(), "name": String(), "population": Integer()})
    except:
        print("'Prefectures' table already exists. Skipping table creation.")

    starttime = time.time()

    while True:
        vacc = fetchVaccines()
        vacc.to_sql('vaccines', con = dbConnection, index = False, if_exists = 'replace', dtype = {"date": Date(), "prefecture": Integer(), "gender": String(), "age": String(), "medical_worker": Boolean(), "status": Integer(), "count": Integer()})
        time.sleep(3600 - (time.time() - starttime) % 3600)

