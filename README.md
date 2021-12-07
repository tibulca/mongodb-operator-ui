## Install

```
helm upgrade \
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

## Run locally

### Prerequisites

1. [Node.js 14+](https://nodejs.org/en/download/)
2. [yarn](https://classic.yarnpkg.com/lang/en/docs/install)

```
git clone https://github.com/tibulca/mdb-op-ui.git
cd mdb-op-ui
yarn install
yarn dev
```

open http://localhost:3000
