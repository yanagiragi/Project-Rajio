
# Icecast2 + Ices0 架設筆記

    P.S. 預設密碼帳號為 admin:4321


## install Icecast2

    ```
	wget http://downloads.xiph.org/releases/icecast/icecast-2.4.4.tar.gz
	tar -xvf icecast-2.4.4.tar.gz
	./configure
	make install
	sudo make install
    ```

    如果有遇到套件問題, 試試看

    ```
	sudo apt-get install libxslt-dev libvorbis-dev
    ```

## install IceS

    Dependicies:
        
        sudo apt-get install libshout-dev

    In this case, we use IceS0 (deprecated)

	```
    wget http://downloads.us.xiph.org/releases/ices/ices-0.4.tar.gz
    tar -xvf ices-0.4.tar.gz
    cd ices-0.4
    sudo ./configure
    make install && sudo make install

    alias iceS=$CURRENT_PATH/src/iceS
    ```


## Configuring Icecast

	```
    wget https://raw.githubusercontent.com/yanagiragi/Project-Rajio/master/Icecast2/icecast.xml
    mkdir /etc/icecast2 # 如果資料夾不存在
    sudo cp icecast.xml /etc/icecast2/icecast.xml
    ```

## Running Icecast

    P.S. do not sudo!
    
    icecast2 -c /etc/icecast2/icecast.xml

## Configure IceS

	```
    sudo mkdir /etc/ices
    cd /etc/ices
    touch Playlist.txt
    wget https://raw.githubusercontent.com/yanagiragi/Project-Rajio/master/Icecast2/ices.conf
    wget https://raw.githubusercontent.com/yanagiragi/Project-Rajio/master/Icecast2/ices_go
    ```

## Add Songs Path to Playlist.txt

    Absolute path is recommended, e.g.
    
        /etc/ices/1.mp3

## Copy Your Songs to /etc/ices/Storage

    mkdir Storage
    cp $SONGS /etc/ices/Storage/

## Running 

    ./ices_go

## Listening

    Visit localhost:8000 for Icecast2 Administration control

    Visit localhost:8000/ices for Listening

---

## Addition Settings

### Port forwarding for windows with VMWare

    開啟 Virtual Network Editor

    先點選 Change Setting 開始修改設定的權限

    選擇對應的網卡，點選之後選 NAT SSettings

    Add, 輸入對應 VM 的IP (可在VM中用ifconfig看)，確定


### 接下來還需要設定Windows的防火牆

    控制台\系統及安全性\Windows 防火牆\進階設定\輸入規則

    點選右邊的 新增規則

    選 tcp, forwarding 8000 port，一路確定下去

## 測試

    連上妳的ip + :8000/ices 即可
