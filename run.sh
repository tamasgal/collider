#!/usr/bin/env bash

cat tools.js gui.js elements.js main.js test.js > foo.js && node foo.js && rm foo.js
