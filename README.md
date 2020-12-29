
# AirDash

A new/experimental web frontend for showing realtime ADS-B (airplane) and AIS (ship) data.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Screenshots](#screenshots)
- [Quickstart](#quickstart)
  - [Run directly from source](#run-directly-from-source)
  - [Run from Docker (using official builds)](#run-from-docker-using-official-builds)
  - [Build and run from Docker](#build-and-run-from-docker)
- [Project Status & Goals](#project-status--goals)
  - [Goals](#goals)
- [Supported Data Sources](#supported-data-sources)
- [The AirDash Server](#the-airdash-server)
  - [Server responsibilities](#server-responsibilities)
  - [Server API](#server-api)
    - [Authentication](#authentication)
    - [`POST /api/sources/ais/:hostname/:port`](#post-apisourcesaishostnameport)
    - [`GET /api/sources/ais/:hostname/:port`](#get-apisourcesaishostnameport)
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
$ yarn devserver
```
### Run from Docker (using official builds)

Pre-built Docker images are available for x86 and ARM (Raspberry Pi):

```
$ docker run --rm -i -t -p 8888:8000 mik3y/airdash
```

When run as above, the container will expose a web service on `http://localhost:8888`.

### Build and run from Docker

You can build and run from Docker locally, too:

```
$ docker build -t airdash .
$ docker run --rm -i -t -p 8888:8000 airdash
```

## Project Status & Goals

Status: **Alpha**. Things are in rapid development and may be broken. Bug reports and feature requests are welcome, please [file them here](https://github.com/mik3y/airdash/issues).
### Goals

This project is meant to be a standalone webapp for locally visualizing and exploring ADS-B and AIS telemetry data. Why another frontend? I have a few goals (besides the main goal: have fun).

* **Support ADS-B _and_ AIS.** The ADS-B community has better frontends than the similar ship-tracking world. But the needs are so similar. I wanted to try to fix this.

* **Fresh take.** The leading frontends from ADS-B are tried and true. They also make design choices that, for whatever subjective reasons, I just wasn't as attracted to. I specifically wanted to build something leveraging React.

* **Developer-friendly.** It's a goal that this project is straightforward to extend and improve.

## Supported Data Sources

The app currently supports:

* ADS-B data, from [readsb-proto](https://github.com/Mictronics/readsb-protobuf). It does so by connecting to that service's web address through the AirDash client-side javascript application.
* AIS data, from any compatible NMEA TCP stream. It does so by opening a TCP socket from the AirDash server to 

Currently, data sources must be registered dynamically when the app loads.

## The AirDash Server

AirDash is mostly a rich, client-side web application (sometimes called a single-page application or SPA). However, it _also_ includes a service that runs with it.

### Server responsibilities

This simple server has two responsibilities:

1. Run a basic HTTP server to serve up the AirDash javascript/app at the root url (e.g. `http://localhost:8000/`).
2. Optionally, connect to any TCP data sources, and make their data available to the web app, through a built-in API.

Because modern web applications can only fetch data through HTTP/HTTPS, it's responsibility #2 that allows AirDash to read from more than just those kind of sources.

### Server API

This section lists the API supported by the AirDash server.

#### Authentication

There is no authentication on the API. AirDash should only be used in trusted/isolated envrionments.

#### `POST /api/sources/ais/:hostname/:port`

Request that the server listen to a new AIS TCP stream.

Path parameters
* `hostname`: The hostname or IP to connect to.
* `port`: The port to connect to.

Response codes
* `409`: The server is already connecting/connected to this address.
* `200`: Success, the server will now connect to this data source.

Response body
* `status`: The value `ok` when sucessful.

#### `GET /api/sources/ais/:hostname/:port`

Retrieve all recent data for the previously-registered datasource.

Path parameters
* `hostname`: The hostname or IP of the data source. Must match the same value given upon registration.
* `port`: The port of the data source.

Response codes
* `404`: The server is not connected to this data source.
* `200`: Success.

Response body
* `updates`: A map of updates. TODO. Currently changing too rapidly to be documented here, try a live server!

## Contributing

Pull requests, ideas, and improvements are welcome. Please open an issue in the issue tracker to get in touch!

## Changelog

See `CHANGELOG.md`.

## License

All code is offered under the **MIT** license, unless otherwise noted.  Please
see `LICENSE.txt` for the full license.
