/* Mappa pubblica delle zone social free — stessa grafica dell'app Blocca Social. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var locali = [], me = null, scelto = null, pins = {}, tu = null;

  function distanza(a, b) {
    var R = 6371000, r = Math.PI / 180;
    var dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function fmt(m) {
    if (m == null) return '';
    return m < 1000 ? Math.max(10, Math.round(m / 10) * 10) + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km';
  }
  function area(v) { return v.zona || v.indirizzo || ''; }
  function dist(v) { return me ? distanza(me, v) : null; }
  function locale(id) { for (var i = 0; i < locali.length; i++) if (locali[i].id === id) return locali[i]; return null; }

  /* ---------- mappa ---------- */
  var map = L.map('leaflet', { zoomControl: false, tap: false }).setView([41.8925, 12.4950], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  map.attributionControl.setPrefix(false);
  var strati = L.layerGroup().addTo(map);
  map.on('click', function () { $('foglio').classList.remove('on'); });
  $('zoom-piu').addEventListener('click', function () { map.zoomIn(); });
  $('zoom-meno').addEventListener('click', function () { map.zoomOut(); });
  $('f-chiudi').addEventListener('click', function () { $('foglio').classList.remove('on'); });

  function icona(on) {
    return L.divIcon({ className: 'pin-btn', html: '<span class="pin' + (on ? ' on' : '') + '"></span>', iconSize: [44, 44], iconAnchor: [22, 22] });
  }

  function disegna() {
    strati.clearLayers(); pins = {};
    locali.forEach(function (v) {
      L.circle([v.lat, v.lon], { radius: v.raggio || 60, className: 'zona', fillOpacity: 1, opacity: 1, interactive: false }).addTo(strati);
      pins[v.id] = L.marker([v.lat, v.lon], { icon: icona(false), title: v.nome })
        .on('click', function () { seleziona(v.id, true); }).addTo(strati);
    });
    $('sotto').textContent = (locali.length === 1 ? '1 locale' : locali.length + ' locali') +
      ' dove i social si spengono. Goditi la compagnia.';
    elenco();
    requestAnimationFrame(function () {
      map.invalidateSize({ animate: false });
      if (locali.length) map.fitBounds(locali.map(function (v) { return [v.lat, v.lon]; }), { padding: [40, 40], maxZoom: 15, animate: false });
    });
  }

  function elenco() {
    var lista = locali.slice();
    if (me) lista.sort(function (a, b) { return dist(a) - dist(b); });
    if (!scelto || !locale(scelto)) scelto = lista.length ? lista[0].id : null;
    var box = $('righe');
    box.innerHTML = '';
    if (!lista.length) {
      var vuoto = document.createElement('p');
      vuoto.className = 'it muted'; vuoto.style.cssText = 'font-size:16px;padding:12px 0 16px';
      vuoto.textContent = 'Nessun locale aderente per ora.';
      box.appendChild(vuoto);
    }
    lista.forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'riga'; b.dataset.id = v.id;
      var col = document.createElement('span');
      col.style.cssText = 'display:flex;flex-direction:column;gap:2px;text-align:left';
      var n = document.createElement('span'); n.style.fontSize = '18px'; n.textContent = v.nome;
      var a = document.createElement('span'); a.className = 'it muted'; a.style.fontSize = '14px'; a.textContent = area(v);
      col.appendChild(n); col.appendChild(a);
      var d = document.createElement('span'); d.className = 'muted'; d.style.fontSize = '15px'; d.textContent = fmt(dist(v));
      b.appendChild(col); b.appendChild(d);
      b.addEventListener('click', function () { seleziona(v.id, true, true); });
      box.appendChild(b);
    });
    $('sel').style.display = lista.length ? 'flex' : 'none';
    seleziona(scelto, false);
  }

  function seleziona(id, apri, vola) {
    scelto = id;
    Object.keys(pins).forEach(function (k) { pins[k].setIcon(icona(k === id)); pins[k].setZIndexOffset(k === id ? 500 : 0); });
    Array.prototype.forEach.call(document.querySelectorAll('#righe .riga'), function (r) { r.classList.toggle('on', r.dataset.id === id); });
    var v = locale(id);
    if (!v) return;
    var d = dist(v), r = v.raggio || 60;
    $('s-area').textContent = area(v) + (d != null ? ' · a circa ' + fmt(d) + ' da te' : '');
    $('s-nome').textContent = v.nome;
    $('s-raggio').textContent = 'Zona social free nel raggio di ' + r + ' m dal locale.';
    $('f-area').textContent = area(v) + (d != null ? ' · a circa ' + fmt(d) : '');
    $('locale-titolo').textContent = v.nome;
    $('f-raggio').textContent = 'Zona social free · raggio ' + r + ' m';
    $('f-mappe').href = 'https://maps.apple.com/?daddr=' + v.lat + ',' + v.lon + '&dirflg=w';
    $('f-google').href = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + v.lat + ',' + v.lon;
    if (apri) $('foglio').classList.add('on');
    if (vola) { $('mappa').scrollIntoView({ behavior: 'smooth' }); map.setView([v.lat, v.lon], 16); }
  }

  /* ---------- dove sono ---------- */
  $('dove').addEventListener('click', function () {
    if (!navigator.geolocation) { alert('Questo browser non condivide la posizione.'); return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      me = { lat: p.coords.latitude, lon: p.coords.longitude };
      if (!tu) {
        tu = L.marker([me.lat, me.lon], {
          icon: L.divIcon({ className: 'tu', html: '<i class="onda pulse"></i><i class="anello"></i><i class="punto"></i>', iconSize: [44, 44], iconAnchor: [22, 22] }),
          interactive: false, keyboard: false, zIndexOffset: 1000
        }).addTo(map);
      } else tu.setLatLng([me.lat, me.lon]);
      map.setView([me.lat, me.lon], 15);
      elenco();
    }, function () { alert('Non riesco a leggere la posizione.'); }, { enableHighAccuracy: true, timeout: 10000 });
  });

  /* ---------- elenco dei locali ---------- */
  fetch('locali.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) { locali = (d && d.locali) || []; disegna(); })
    .catch(function () {
      $('righe').innerHTML = '<p class="it muted" style="font-size:16px;padding:12px 0 16px">Elenco dei locali non disponibile al momento.</p>';
    });
})();
