<a href="https://coronanippon.com">
<img height=125 src="https://raw.githubusercontent.com/katsukixyz/coronanippon/main/client/src/japanapp.svg"/>
</a>

# Japan COVID-19 Vaccine Dashboard

Japan COVID-19 vaccination data aggregated into a visual format.

# Information

Data is fetched from https://cio.go.jp/c19vaccine_opendata on an hourly basis and written to a PostgreSQL database on `localhost:5432` through the `data` Python service. Population data to compute vaccination percentage comes from the following: https://www.soumu.go.jp/main_sosiki/jichi_gyousei/daityo/jinkou_jinkoudoutai-setaisuu.html.

# Local development

Start this project by running `docker-compose up` in the root directory. By default, the frontend website can be accessed through `http://localhost:3000` with API requests handled through `http://localhost:5000`.

## Environment Variables

In order for the project to run as expected, reference and create the following file in the root directory **prior** to initial runtime. Variable values can be customized.

#### `.env`

```
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=coronanippon_db
DB_HOST=db
DB_PORT=5432
REACT_APP_API_ENDPOINT=http://localhost:5000
```
