## Install
```
helm install \
  --repo https://github.com/tibulca/mdb-op-ui/tree/main \
  mongodb-operator-ui \
  helm_chart \
  --namespace=mongodb
```
OR
```
git clone https://github.com/tibulca/mdb-op-ui.git
cd mdb-op-ui
helm install mongodb-operator-ui helm_chart --namespace=mongodb
```
