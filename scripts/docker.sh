echo "Unite | Docker CLI"
echo "-----------------------------------------"

if [ "$1" == "build" ]; then
    docker build -f Dockerfile -t unite-doctor-backend ./
    elif [ "$1" == "run" ]; then
    docker run -it -p 8080:8080 unite-doctor-backend
    elif [ "$1" == "help" ]; then
    echo "build: builds the docker image"
    echo "run: runs the docker image"
else
    echo "Please enter a valid command"
fi