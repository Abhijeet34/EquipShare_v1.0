#!/bin/bash

# EquipShare Management Script
# Comprehensive script to manage the application lifecycle

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/.logs"
BACKEND_PORT=5001
FRONTEND_PORT=3000

# Colors for output
RED='\e[0;31m'
GREEN='\e[0;32m'
YELLOW='\e[1;33m'
BLUE='\e[0;34m'
NC='\e[0m' # No Color

# Create necessary directories
mkdir -p "$PID_DIR"
mkdir -p "$LOG_DIR"

# Helper functions
print_header() {
    printf "${BLUE}============================================${NC}\n"
    printf "${BLUE}%s${NC}\n" "$1"
    printf "${BLUE}============================================${NC}\n"
}

print_success() {
    printf "${GREEN}✓ %s${NC}\n" "$1"
}

print_error() {
    printf "${RED}✗ %s${NC}\n" "$1"
}

print_warning() {
    printf "${YELLOW}⚠ %s${NC}\n" "$1"
}

print_info() {
    printf "${BLUE}ℹ %s${NC}\n" "$1"
}

# Check if MongoDB is running
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Start MongoDB
start_mongodb() {
    if check_mongodb; then
        print_success "MongoDB is already running"
    else
        print_info "Starting MongoDB..."
        brew services start mongodb-community &>/dev/null || brew services start mongodb/brew/mongodb-community &>/dev/null
        sleep 3
        if check_mongodb; then
            print_success "MongoDB started successfully"
        else
            print_error "Failed to start MongoDB"
            exit 1
        fi
    fi
}

# Stop MongoDB (optional - only if started by script)
stop_mongodb() {
    if check_mongodb; then
        print_info "Stopping MongoDB..."
        
        # Try brew services first (with timeout protection)
        ( brew services stop mongodb-community &>/dev/null || brew services stop mongodb/brew/mongodb-community &>/dev/null ) &
        local brew_pid=$!
        
        # Wait max 3 seconds for brew services
        local count=0
        while kill -0 $brew_pid 2>/dev/null && [ $count -lt 3 ]; do
            sleep 1
            ((count++))
        done
        
        # Force kill the brew process if still running
        kill -9 $brew_pid 2>/dev/null || true
        
        # Wait a moment for MongoDB to stop gracefully
        sleep 2
        
        # Force kill MongoDB if still running
        if check_mongodb; then
            print_warning "MongoDB still running, force stopping..."
            pkill -9 mongod 2>/dev/null || true
            sleep 1
        fi
        
        if check_mongodb; then
            print_error "Failed to stop MongoDB"
        else
            print_success "MongoDB stopped"
        fi
    else
        print_info "MongoDB is not running"
    fi
}

# Check if backend dependencies are installed
check_backend_deps() {
    if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
        print_warning "Backend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/backend"
        npm install
        print_success "Backend dependencies installed"
    fi
}

# Check if frontend dependencies are installed
check_frontend_deps() {
    if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
        print_warning "Frontend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/frontend"
        npm install
        print_success "Frontend dependencies installed"
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
        print_success ".env file created"
    fi
}

# Check if database has data
check_database_data() {
    local count=$(mongosh --quiet --eval "db.getSiblingDB('equipment-lending').equipment.countDocuments()" 2>/dev/null || echo "0")
    if [ "$count" -eq "0" ]; then
        return 1
    else
        return 0
    fi
}

# Seed database with basic data
seed_database() {
    print_info "Seeding database with basic data..."
    cd "$PROJECT_ROOT/backend"
    npm run seed > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Database seeded successfully"
        print_info "Default credentials:"
        echo "   Admin:    admin@school.com / Admin@123"
        echo "   Staff:    staff@school.com / Staff@123"
        echo "   John Smith (Student1):    student1@school.com / Student@123"
        echo "   Emily Rodriguez (Student2): student2@school.com / Student@123"
    else
        print_error "Failed to seed database"
        exit 1
    fi
}

# Populate demo data (recommended for testing/demos)
populate_demo_data() {
    local mode=${1:-reset}  # default to reset
    
    if [ "$mode" = "reset" ]; then
        print_info "Populating database with comprehensive demo data..."
        cd "$PROJECT_ROOT/backend"
        npm run demo:reset 2>&1 | grep -v "fnm" | grep -v "unfunction" | tail -n 60
    else
        print_info "Adding demo data to existing database..."
        cd "$PROJECT_ROOT/backend"
        npm run demo 2>&1 | grep -v "fnm" | grep -v "unfunction" | tail -n 60
    fi
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Demo data populated successfully"
    else
        print_error "Failed to populate demo data"
        exit 1
    fi
}

# Check if port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Kill process on port
kill_port() {
    local port=$1
    print_info "Killing process on port $port..."
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Start backend
start_backend() {
    cd "$PROJECT_ROOT/backend"
    
    if check_port $BACKEND_PORT; then
        print_warning "Backend is already running on port $BACKEND_PORT"
        read -p "Restart backend? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restarting backend..."
            stop_backend
            sleep 1
        else
            print_success "Using existing backend instance"
            return 0
        fi
    fi
    
    print_info "Starting backend on port $BACKEND_PORT..."
    nohup npm start > "$LOG_DIR/backend.log" 2>&1 &
    echo $! > "$PID_DIR/backend.pid"
    sleep 3
    
    if check_port $BACKEND_PORT; then
        print_success "Backend started on http://localhost:$BACKEND_PORT"
    else
        print_error "Failed to start backend. Check $LOG_DIR/backend.log"
        return 1
    fi
}

# Start frontend
start_frontend() {
    cd "$PROJECT_ROOT/frontend"
    
    if check_port $FRONTEND_PORT; then
        print_warning "Frontend is already running on port $FRONTEND_PORT"
        read -p "Restart frontend? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restarting frontend..."
            stop_frontend
            sleep 1
        else
            print_success "Using existing frontend instance"
            return 0
        fi
    fi
    
    print_info "Starting frontend on port $FRONTEND_PORT..."
    # Ensure NODE_OPTIONS does not enable experimental webstorage, which breaks HtmlWebpackPlugin
    NODE_OPTIONS="" nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "$PID_DIR/frontend.pid"
    sleep 5
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend started on http://localhost:$FRONTEND_PORT"
    else
        print_error "Failed to start frontend. Check $LOG_DIR/frontend.log"
        return 1
    fi
}

# Stop backend
stop_backend() {
    if [ -f "$PID_DIR/backend.pid" ]; then
        local pid=$(cat "$PID_DIR/backend.pid")
        if ps -p $pid > /dev/null 2>&1; then
            print_info "Stopping backend (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 2  # Wait for graceful shutdown
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null || true
            fi
            rm "$PID_DIR/backend.pid"
            print_success "Backend stopped"
        else
            rm "$PID_DIR/backend.pid"
            print_warning "Backend was not running"
        fi
    else
        # Fallback: try to kill by port
        if check_port $BACKEND_PORT; then
            kill_port $BACKEND_PORT
            print_success "Backend stopped"
        else
            print_warning "Backend was not running"
        fi
    fi
}

# Stop frontend
stop_frontend() {
    if [ -f "$PID_DIR/frontend.pid" ]; then
        local pid=$(cat "$PID_DIR/frontend.pid")
        if ps -p $pid > /dev/null 2>&1; then
            print_info "Stopping frontend (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 2  # Wait for graceful shutdown
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null || true
            fi
            rm "$PID_DIR/frontend.pid"
            print_success "Frontend stopped"
        else
            rm "$PID_DIR/frontend.pid"
            print_warning "Frontend was not running"
        fi
    else
        # Fallback: try to kill by port
        if check_port $FRONTEND_PORT; then
            kill_port $FRONTEND_PORT
            print_success "Frontend stopped"
        else
            print_warning "Frontend was not running"
        fi
    fi
}

# Clean up caches and temporary files
cleanup() {
    print_info "Cleaning up caches and temporary files..."
    
    # Clean backend cache
    if [ -d "$PROJECT_ROOT/backend/node_modules/.cache" ]; then
        rm -rf "$PROJECT_ROOT/backend/node_modules/.cache"
        print_success "Backend cache cleared"
    fi
    
    # Clean frontend cache
    if [ -d "$PROJECT_ROOT/frontend/node_modules/.cache" ]; then
        rm -rf "$PROJECT_ROOT/frontend/node_modules/.cache"
        print_success "Frontend cache cleared"
    fi
    
    # Clean logs
    if [ -d "$LOG_DIR" ]; then
        rm -f "$LOG_DIR"/*.log
        print_success "Logs cleared"
    fi
    
    # Clean PID files
    if [ -d "$PID_DIR" ]; then
        rm -f "$PID_DIR"/*.pid
        print_success "PID files cleared"
    fi
}

# Status check
check_status() {
    print_header "Service Status"
    
    printf "\n${BLUE}MongoDB:${NC}\n"
    if check_mongodb; then
        print_success "Running"
        if check_database_data; then
            print_success "Database has data"
        else
            print_warning "Database is empty (run: ./manage.sh seed)"
        fi
    else
        print_error "Not running"
    fi
    
    printf "\n${BLUE}Backend (Port $BACKEND_PORT):${NC}\n"
    if check_port $BACKEND_PORT; then
        print_success "Running at http://localhost:$BACKEND_PORT"
    else
        print_error "Not running"
    fi
    
    printf "\n${BLUE}Frontend (Port $FRONTEND_PORT):${NC}\n"
    if check_port $FRONTEND_PORT; then
        print_success "Running at http://localhost:$FRONTEND_PORT"
    else
        print_error "Not running"
    fi
    
    echo ""
}

# Get auth token
get_token() {
    local email="${1:-admin@school.com}"
    
    if ! check_mongodb; then
        print_error "MongoDB is not running. Start it with: ./manage.sh start"
        exit 1
    fi
    
    cd "$PROJECT_ROOT/backend"
    node scripts/getToken.js "$email"
}

# Show help
show_help() {
    printf "${BLUE}EquipShare Management Script${NC}\n"
    printf "\n"
    printf "${GREEN}Usage:${NC}\n"
    printf "    ./manage.sh [command]\n"
    printf "\n"
    printf "${GREEN}Commands:${NC}\n"
    printf "    ${YELLOW}start${NC}       Start all services (MongoDB, Backend, Frontend)\n"
    printf "                Automatically seeds database if empty\n"
    printf "                \n"
    printf "    ${YELLOW}stop${NC}        Stop all services and clean up resources\n"
    printf "    \n"
    printf "    ${YELLOW}restart${NC}     Stop and start all services\n"
    printf "    \n"
    printf "    ${YELLOW}status${NC}      Check status of all services\n"
    printf "    \n"
    printf "    ${YELLOW}seed${NC}        Seed database with initial data\n"
    printf "                Offers choice between demo or basic data\n"
    printf "    \n"
    printf "    ${YELLOW}reseed${NC}      Clear and reseed database with fresh data\n"
    printf "                Offers choice between demo or basic data\n"
    printf "    \n"
    printf "    ${YELLOW}demo${NC}        Populate comprehensive demo data\n"
    printf "                Includes requests, overdue items, analytics data\n"
    printf "    \n"
    printf "    ${YELLOW}get-token${NC}   Get JWT token for API testing\n"
    printf "                Usage: ./manage.sh get-token [email]\n"
    printf "                Default: admin@school.com\n"
    printf "    \n"
    printf "    ${YELLOW}clean${NC}       Clean caches and temporary files\n"
    printf "    \n"
    printf "    ${YELLOW}logs${NC}        Show recent logs\n"
    printf "                Options: backend, frontend, all\n"
    printf "    \n"
    printf "    ${YELLOW}help${NC}        Show this help message\n"
    printf "\n"
    printf "${GREEN}Examples:${NC}\n"
    printf "    ./manage.sh start                    # Start everything\n"
    printf "    ./manage.sh stop                     # Stop everything\n"
    printf "    ./manage.sh status                   # Check what's running\n"
    printf "    ./manage.sh get-token                # Get admin token\n"
    printf "    ./manage.sh get-token staff@school.com  # Get staff token\n"
    printf "    ./manage.sh logs backend             # View backend logs\n"
    printf "    ./manage.sh clean                    # Clean up caches\n"
    printf "\n"
    printf "${GREEN}Default Credentials:${NC}\n"
    printf "    Admin:    admin@school.com / Admin@123\n"
    printf "    Staff:    staff@school.com / Staff@123\n"
    printf "    Student1: student1@school.com / Student@123\n"
    printf "    Student2: student2@school.com / Student@123\n"
    printf "\n"
    printf "${GREEN}Ports:${NC}\n"
    printf "    Backend:  http://localhost:$BACKEND_PORT\n"
    printf "    Frontend: http://localhost:$FRONTEND_PORT\n"
    printf "    Swagger:  http://localhost:$BACKEND_PORT/api/docs\n"
    printf "    Health:   http://localhost:$BACKEND_PORT/api/health\n"
    printf "\n"
}

# Start all services
start_all() {
    print_header "Starting EquipShare"
    
    # Check MongoDB
    start_mongodb
    
    # Setup
    setup_env
    check_backend_deps
    check_frontend_deps
    
    # Check and seed database if needed
    if ! check_database_data; then
        print_warning "Database is empty"
        echo ""
        printf "${BLUE}Select seeding option:${NC}\n"
        echo "  1) Demo data (Recommended - includes all features)"
        echo "  2) Basic data (Users + Equipment only)"
        echo ""
        read -p "Enter choice (1/2): " -n 1 -r
        echo ""
        
        if [[ $REPLY = "2" ]]; then
            seed_database
        else
            populate_demo_data reset
        fi
    else
        print_success "Database already has data"
        read -p "Do you want to reseed the database? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_warning "This will delete all existing data!"
            read -p "Are you sure? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo ""
                printf "${BLUE}Select seeding option:${NC}\n"
                echo "  1) Demo data (Recommended - includes all features)"
                echo "  2) Basic data (Users + Equipment only)"
                echo ""
                read -p "Enter choice (1/2): " -n 1 -r
                echo ""
                
                if [[ $REPLY = "2" ]]; then
                    seed_database
                else
                    populate_demo_data reset
                fi
            else
                print_info "Reseed cancelled, using existing data"
            fi
        else
            print_info "Using existing data"
        fi
    fi
    
    # Start services
    start_backend
    start_frontend
    
    echo ""
    print_success "EquipShare is now running!"
    echo ""
    printf "${GREEN}Service Endpoints:${NC}\n"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend:  http://localhost:$BACKEND_PORT"
    echo "  Swagger:  http://localhost:$BACKEND_PORT/api/docs"
    echo "  Health:   http://localhost:$BACKEND_PORT/api/health"
    echo ""
    
    # Display admin token for convenience
    print_info "Generating admin token for API testing..."
    echo ""
    cd "$PROJECT_ROOT/backend"
    node scripts/getToken.js "admin@school.com"
    echo ""
    
    print_info "Run './manage.sh get-token <email>' to get tokens for other users"
    print_info "Run './manage.sh logs' to view logs"
    print_info "Run './manage.sh stop' to stop all services"
    echo ""
}

# Stop all services
stop_all() {
    local stop_mongodb_mode=${1:-prompt}
    
    print_header "Stopping EquipShare"
    
    stop_frontend
    stop_backend
    sleep 1  # Ensure processes are fully stopped
    cleanup
    
    # Handle MongoDB based on mode: "yes", "no", or "prompt"
    if check_mongodb; then
        case "$stop_mongodb_mode" in
            yes)
                # Stop without prompting (used during restart)
                stop_mongodb
                ;;
            no)
                # Don't stop, don't prompt
                print_info "MongoDB left running"
                ;;
            prompt|*)
                # Ask user
                print_warning "MongoDB is still running (may be used by other projects)"
                read -p "Do you want to stop MongoDB as well? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    stop_mongodb
                else
                    print_info "MongoDB left running"
                fi
                ;;
        esac
    fi
    
    print_success "EquipShare services stopped and cleaned up"
}

# Restart all services (including MongoDB)
restart_all() {
    print_header "Restarting EquipShare"
    print_info "This will restart all services including MongoDB"
    
    # Stop everything including MongoDB (no prompt)
    stop_all yes
    
    sleep 2
    
    # Start everything fresh
    start_all
}

# Reseed database
reseed_database() {
    print_header "Reseeding Database"
    print_warning "This will delete all existing data!"
    read -p "Are you sure? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        printf "${BLUE}Select seeding option:${NC}\n"
        echo "  1) Demo data (Recommended - includes all features)"
        echo "  2) Basic data (Users + Equipment only)"
        echo ""
        read -p "Enter choice (1/2): " -n 1 -r
        echo ""
        
        if [[ $REPLY = "2" ]]; then
            seed_database
        else
            populate_demo_data reset
        fi
    else
        print_info "Reseed cancelled"
    fi
}

# Show logs
show_logs() {
    local service=$1
    
    case $service in
        backend)
            if [ -f "$LOG_DIR/backend.log" ]; then
                print_info "Backend logs (last 50 lines):"
                tail -n 50 "$LOG_DIR/backend.log"
            else
                print_warning "No backend logs found"
            fi
            ;;
        frontend)
            if [ -f "$LOG_DIR/frontend.log" ]; then
                print_info "Frontend logs (last 50 lines):"
                tail -n 50 "$LOG_DIR/frontend.log"
            else
                print_warning "No frontend logs found"
            fi
            ;;
        all|*)
            show_logs backend
            echo ""
            show_logs frontend
            ;;
    esac
}

# Interactive menu
show_menu() {
    while true; do
        print_header "EquipShare Management"
        echo ""
        echo "What would you like to do?"
        echo ""
        printf "  ${GREEN}Service Management:${NC}\n"
        echo "    1) Start all services (auto-seeds if DB empty)"
        echo "    2) Stop all services"
        echo "    3) Restart all services"
        echo "    4) Check service status"
        echo ""
        printf "  ${BLUE}Database:${NC}\n"
        echo "    5) Seed/Reseed database"
        echo "    6) Populate demo data (recommended)"
        echo ""
        printf "  ${BLUE}Maintenance:${NC}\n"
        echo "    7) View logs"
        echo "    8) Clean caches"
        echo ""
        printf "  ${YELLOW}Help & Exit:${NC}\n"
        echo "    9) Show help"
        echo "    0) Exit"
        echo ""
        read -p "Enter your choice [0-9]: " choice
        echo ""
        
        case $choice in
            1) start_all ;;
            2) stop_all ;;
            3) restart_all ;;
            4) check_status ;;
            5) 
                echo "Database seeding options:"
                echo "  1) Seed (only if empty)"
                echo "  2) Reseed (clear and reload all data)"
                read -p "Enter choice [1-2]: " seed_choice
                setup_env
                start_mongodb
                case $seed_choice in
                    1) 
                        if ! check_database_data; then
                            echo ""
                            printf "${BLUE}Select seeding option:${NC}\n"
                            echo "  1) Demo data (Recommended)"
                            echo "  2) Basic data"
                            read -p "Enter choice (1/2): " -n 1 -r
                            echo ""
                            if [[ $REPLY = "2" ]]; then
                                seed_database
                            else
                                populate_demo_data reset
                            fi
                        else
                            print_warning "Database already has data. Use option 2 to reseed."
                        fi
                        ;;
                    2) reseed_database ;;
                    *) print_error "Invalid choice" ;;
                esac
                ;;
            6)
                setup_env
                start_mongodb
                populate_demo_data reset
                ;;
            7) 
                echo "View logs for:"
                echo "  1) Backend"
                echo "  2) Frontend"
                echo "  3) Both"
                read -p "Enter choice [1-3]: " log_choice
                case $log_choice in
                    1) show_logs backend ;;
                    2) show_logs frontend ;;
                    3) show_logs all ;;
                    *) print_error "Invalid choice" ;;
                esac
                ;;
            8) cleanup ;;
            9) show_help ;;
            0) echo ""; print_success "Goodbye!"; exit 0 ;;
            *) print_error "Invalid choice" ;;
        esac
        
        # Pause before showing menu again
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Main command handler
if [ $# -eq 0 ]; then
    # No arguments - show interactive menu
    show_menu
else
    # Arguments provided - run command
    case "${1:-}" in
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            restart_all
            ;;
        status)
            check_status
            ;;
        seed)
            setup_env
            start_mongodb
            seed_database
            ;;
        reseed)
            setup_env
            start_mongodb
            reseed_database
            ;;
        demo)
            setup_env
            start_mongodb
            populate_demo_data reset
            ;;
        get-token)
            get_token "${2:-admin@school.com}"
            ;;
        clean)
            cleanup
            ;;
        logs)
            show_logs "${2:-all}"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: ${1}"
            echo ""
            show_help
            exit 1
            ;;
    esac
fi

exit 0
