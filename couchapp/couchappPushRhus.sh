#!/bin/bash
couchapp push $1
couchapp push _design/gc-utils $1
