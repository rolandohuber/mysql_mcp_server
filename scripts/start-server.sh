#!/bin/bash

# MySQL MCP Server startup script
# This script provides different ways to start the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MODE="stdio"
PORT="4001"
ENV_FILE=".env"

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -m, --mode MODE     Server mode: stdio, websocket, http (default: stdio)"
    echo "  -p, --port PORT     Port for websocket/http modes (default: 3001)"
    echo "  -e, --env FILE      Environment file (default: .env)"
    echo "  -d, --dev           Run in development mode"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Start in stdio mode"
    echo "  $0 -m websocket -p 3001     # Start WebSocket server on port 3001"
    echo "  $0 -m http -p 3002          # Start HTTP server on port 3002"
    echo "  $0 -d                       # Start in development mode"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        -d|--dev)
            DEV_MODE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Validate mode
if [[ ! "$MODE" =~ ^(stdio|websocket|http)$ ]]; then
    echo -e "${RED}Invalid mode: $MODE. Must be stdio, websocket, or http${NC}"
    exit 1
fi

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${YELLOW}Warning: Environment file $ENV_FILE not found${NC}"
    if [[ -f ".env.example" ]]; then
        echo -e "${YELLOW}Copying .env.example to $ENV_FILE${NC}"
        cp .env.example "$ENV_FILE"
        echo -e "${RED}Please edit $ENV_FILE with your database credentials${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build if dist doesn't exist or in development mode
if [[ ! -d "dist" ]] || [[ "$DEV_MODE" == true ]]; then
    echo -e "${YELLOW}Building project...${NC}"
    npm run build
fi

# Set environment variables
export MCP_MODE="$MODE"
export MCP_PORT="$PORT"

# Load environment file
if [[ -f "$ENV_FILE" ]]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

echo -e "${GREEN}Starting MySQL MCP Server...${NC}"
echo -e "${GREEN}Mode: $MODE${NC}"
if [[ "$MODE" != "stdio" ]]; then
    echo -e "${GREEN}Port: $PORT${NC}"
fi

# Start the server
if [[ "$DEV_MODE" == true ]]; then
    echo -e "${YELLOW}Running in development mode${NC}"
    npm run dev
else
    npm start
fi
