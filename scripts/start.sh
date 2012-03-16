#!/bin/bash
nohup node server.js &
echo $! > node.PID
