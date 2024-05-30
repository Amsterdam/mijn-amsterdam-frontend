bsn=$1

curl -X POST -H "Content-Type: application/json" -d $bsn "http://localhost:3100/remote/vakantieverhuur/bsn"
