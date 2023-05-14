# API [Demo](https://getonthecar.com/docs)

# 部署方式

1. 首先git clone 這個repo

2. 必須新增.env環境變數到根目錄，否則會報錯且沒有資料可使用,詳細資料庫參數將於文件提供
    ###### PORT=<資料庫的port>
    ###### DB_HOST=<資料庫的host>
    ###### DB_USER=<資料庫的username>
    ###### DB_PASSWORD=<資料庫的password>
    ###### DB_DATABASE=<使用的資料庫>
3. build docker image``
    ###### ``docker build -t kdan_api .``
4. run docker container
    ######  ``docker run -d -p 8000:8000 kdan_api``
5. open 127.0.0.1:8000/docs
    ##### 127.0.0.1:8000/docs 能使用Swagger UI 觀看與操作API文件
