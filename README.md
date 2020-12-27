# AirDash

A new/experimental web frontend for showing realtime ADS-B data.

## Quickstart

```
$ cd airdash/
$ yarn
$ yarn devserver
```

## Project Status & Goals

Status: **Alpha**. Things are in rapid development and may be broken.

### Goals

This project is meant to be a standalone webapp for locally visualizing and exploring ADS-B and AIS telemetry data. Why another frontend? I have a few goals (besides the main goal: have fun).

* **Modern stack / fresh take.** The leading frontends from ADS-B are tried and true. They also make design choices that, for whatever subjective reasons, I just wasn't as attracted to. I specifically wanted to build something leveraging React.

* **Support ADS-B _and_ AIS.** The ADS-B community has better frontends than the similar ship-tracking world. But the needs are so similar. I wanted to try to fix this.

* **Developer-friendly.** It's a goal that this project is straightforward to extend and improve.


## Design

This section will cover some major design choices and components. You do not need to read this to use the project.