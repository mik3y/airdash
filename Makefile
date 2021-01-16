BASE_URL := https://raw.githubusercontent.com/Mictronics/readsb-protobuf/dev/webapp/src/db

all: db/aircrafts.json db/operators.json db/types.json

db:
	@mkdir -p $@

db/%.json: db
	@echo "Downloading $@ ..."
	@curl -sL -o $@ $(BASE_URL)/$$(basename $@)

clean:
	rm -f db/*.json

.PHONY: all clean
