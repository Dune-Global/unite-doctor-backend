docker run -d --name mongo-db-docker -e MONGO_INITDB_ROOT_USERNAME=uniteadmin -e MONGO_INITDB_ROOT_PASSWORD=duneglobal2002 -p 27017:27017 -v unite-doctor-backend:/data/db mongo:7.0
