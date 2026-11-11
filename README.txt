V CURSOR SPARK TRAIL PATCH
Extract into the ROOT of Vimal-Aqua and overwrite:
  js/vimal27-enhancements.js
Redeploy, then hard refresh (Ctrl+Shift+R).

- Golden sparks follow the V cursor as you move; a small burst on click.
- Works on every page that already loads js/vimal27-enhancements.js.
- Desktop/mouse only. Off on touch devices and for "reduce motion" users.
- To tune: in addSparkTrail() change
    carry >= 7        (smaller = more sparks)
    MAX_PARTICLES     (220)
    COLORS            (gold palette)
