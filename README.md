
# AirDash

A new/experimental web frontend for showing realtime ADS-B (airplane) and AIS (ship) data.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Screenshots](#screenshots)
- [Quickstart](#quickstart)
  - [Run directly from source](#run-directly-from-source)
  - [Run from Docker (using official builds)](#run-from-docker-using-official-builds)
  - [Build and run from Docker](#build-and-run-from-docker)
- [Configuration](#configuration)
  - [Environment variables](#environment-variables)
- [Project Status & Goals](#project-status--goals)
  - [Goals](#goals)
  - [Supported Data Sources](#supported-data-sources)
    - [`readsb-proto://` (ADS-B data)](#readsb-proto-ads-b-data)
    - [`ais-tcp://` (AIS data from a TCP stream)](#ais-tcp-ais-data-from-a-tcp-stream)
    - [`ais-serial://` (AIS data from a serial port)](#ais-serial-ais-data-from-a-serial-port)
- [The AirDash Server](#the-airdash-server)
  - [Server responsibilities](#server-responsibilities)
  - [Server API](#server-api)
    - [Authentication](#authentication)
    - [`GET /api/entities`](#get-apientities)
    - [`GET /api/data-sources`](#get-apidata-sources)
    - [`POST /api/data-sources`](#post-apidata-sources)
- [Developer instructions](#developer-instructions)
  - [Prerequisites](#prerequisites)
  - [Using the `devserver`](#using-the-devserver)
  - [Directory structure](#directory-structure)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshots

Planes |  Ships
:-------------------------:|:-------------------------:
![Planes overview](https://user-images.githubusercontent.com/390829/103249996-cc0b6c00-493f-11eb-91a3-c5f423d9f250.png)  |  ![Ship overview](https://user-images.githubusercontent.com/390829/103249975-bbf38c80-493f-11eb-90dc-12af4b4a0620.png)

## Quickstart

Here's how you can give AirDash a spin.
### Run directly from source

```
$ cd airdash/
$ yarn
$ export DATA_SOURCES=readsb-proto://localhost:8080,ais-tcp://localhost:10111
$ yarn devserver
```
### Run from Docker (using official builds)

Pre-built Docker images are available for x86 and ARM (Raspberry Pi):

```
$ docker run --rm -i -t -p 8888:8000 -e DATA_SOURCES=ais-tcp://localhost:10111 mik3y/airdash
```

When run as above, the container will expose a web service on `http://localhost:8888`.

### Build and run from Docker

You can build and run from Docker locally, too:

```
$ docker build -t airdash .
$ docker run --rm -i -t -p 8888:8000 -e DATA_SOURCES=ais-tcp://localhost:10111 airdash
```

## Configuration

### Environment variables

* `DATA_SOURCES`: A comma-delimited list of data sources to connect to. See _Supported Data Sources_ for configuration details.

## Project Status & Goals

Status: **Alpha**. Things are in rapid development and may be broken. Bug reports and feature requests are welcome, please [file them here](https://github.com/mik3y/airdash/issues).
### Goals

This project is meant to be a standalone webapp for locally visualizing and exploring ADS-B and AIS telemetry data. Why another frontend? I have a few goals (besides the main goal: have fun).

* **Support ADS-B _and_ AIS.** The ADS-B community has better frontends than the similar ship-tracking world. But the needs are so similar. I wanted to try to fix this.

* **Fresh take.** The leading frontends from ADS-B are tried and true. They also make design choices that, for whatever subjective reasons, I just wasn't as attracted to. I specifically wanted to build something leveraging React.

* **Developer-friendly.** It's a goal that this project is straightforward to extend and improve, and that development is decoupled from development of the underlying data sources.

### Supported Data Sources

The app currently supports:

#### `readsb-proto://` (ADS-B data)

ADS-B (aircraft) data is supported through [readsb-proto](https://github.com/Mictronics/readsb-protobuf). You should be running `readsb-proto` somewhere on your network.

Example:

```
# Read from readsb-proto which is runnning locally on port 8080.
DATA_SOURCES=readsb-proto://localhost:8080
```

#### `ais-tcp://` (AIS data from a TCP stream)

AIS (aircraft) data can be read from a TCP stream that exposes in in NMEA format.

Example:

```
# Read AIS data from a server offering it locally on port 10111.
DATA_SOURCES=ais-tcp://localhost:10111
```


#### `ais-serial://` (AIS data from a serial port)

AIS (aircraft) data can be read from a serial port that exposes in in NMEA format.

Example:

```
# Read AIS data from the local serial port
DATA_SOURCES=ais-serial:///dev/ttyS0?baud=57600
```

Note: When running AirDash under Docker, you may need to supply the flag `--device=/dev/ttyS0` to expose your serial device to Docker.

## The AirDash Server

AirDash is mostly a rich, client-side web application (sometimes called a single-page application or SPA). However, it _also_ includes a service that runs with it.

### Server responsibilities

This simple server has two responsibilities:

1. Run a basic HTTP server to serve up the AirDash javascript/app at the root url (e.g. `http://localhost:8000/`).
2. Connect and listen to (or poll) data sources, aggregating their updates and making it available to the web app, through a built-in API.

### Server API

This section lists the API supported by the AirDash server.

#### Authentication

There is no authentication on the API. AirDash should only be used in trusted/isolated envrionments.

#### `GET /api/entities`

Get all tracked entities. The frontend polls this endpoint to keep the map view up-to-date.

Returns a map, keyed by unique entity id, with the entity data. Each entity is an object consisting of:
* `id`: The unique entitiy ID. While this value shouldn't be interpreted or relied on for other purposes, it will generally be the `ICAO` code (ADS-B) or `MMSI` (AIS).
* `type`: One of `"AIS"`, `"ADSB"`.
* `lat`: The last seen latititude.
* `lon`: The last seen longitude.
* `lastUpdatedMillis`: The timestamp data from this entity was last recorded.
* `adsbData`: If (and only if) `type == "ADSB"`, an object containing the detailed, aggregated ADS-B data.
* `aisData`: If (and only if) `type == "AIS"`, an object containing the detailed, aggregated AIS data.

#### `GET /api/data-sources`

Lists all configured data sources.

Returns: A list of data source, each an object with fields:
* `id`: An opaque and unique string identifying the data source.
* `type`: One of `"AIS"`, `"ADSB"`.

#### `POST /api/data-sources`

Dynamically add a new data source.

Request fields
* `url`: The URL of the new data source.

Response codes
* `400`: Invalid URL or data source already exists.

Response body
* `status`: The value `ok` when sucessful.


## Developer instructions

These notes are for folks interested in modifying or extending airdash.

### Prerequisites

You'll need a recent version of nodejs, and the tool yarn. Once you have node installed, install yarn:

```
npm install -g yarn
```

### Using the `devserver`

When you run the server using `yarn devserver` instead of `yarn start`, the server runs in development mode. This enables two features:

* Frontend code changes (code in `src/`) are automatically built and hot reloaded in your browser.
* Backend code changes (code in `server/`) cause the devserver to reload.

### Directory structure

Here is how the code is structured.

* `server/`: All code implementing the backend server. This small server application uses the [Koa web framework](https://koajs.com/).
* `webapp/`: All code implementing the frontend. This is a [React JS](https://reactjs.org/) single page web application.
* `proto/`: Data structure definitions, in [Protocol Buffer](https://developers.google.com/protocol-buffers) format.

Both the server and the webapp depend on `proto` files. However, no other code is currently shared between these applications.

## Contributing

Pull requests, ideas, and improvements are welcome. Please open an issue in the issue tracker to get in touch!

## Changelog

See `CHANGELOG.md`.

## License

All code is offered under the **MIT** license, unless otherwise noted.  Please
see `LICENSE.txt` for the full license.
