1. log streaming
2. zoom on double click
3. auth?
4. slack integration? if slack secret found then send cluster change notifications
5. status icon for each resource (running, pending, completed, failed etc.)
6. auto-refresh (every x seconds / after each action that requires refresh)
7. actions
   1. cluster
      - install operator
      - install CRDs
      - install CR
   2. resource
      - install TLS
      - scale up/down
   3. operator
      - stop / start (scale to 0 / 1)
   4. sts
      - rolling restart?
   5. all k8s resources
      - update specs where possible
   6. secrets
      - update data
8. decode secrets
9. load cluster from e2e snapshot
10. metrics
    1. expose metrics from operator
    2. prometheus (or mdb?) / grafana / alert manager. Can we use
    3. implement health status based on metrics and display those metrics in UI
11. show resource details in a right-side "drawer" instead of a modal
12. group nodes based on settings (e.g. PVCs) - on click show a modal with these nodes
13. multi-cluster
14. filters (e.g. not "\*operator-tests\*")
15. default namespace (if operator is not installed)
16. search (name, labels)
17. dark theme for graph?
18. [x] helm chart
19.
