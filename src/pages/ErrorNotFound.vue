<template>
  <q-page class="q-pa-md not-found-page">
    <div class="not-found-wrap">
      <div class="text-overline text-indigo-8">Route not found</div>
      <div class="not-found-code">404</div>
      <div class="text-h5 q-mb-sm">That page is not in your tracker.</div>
      <div class="text-subtitle1 text-grey-7 q-mb-lg">
        Jump back into your active search flow from one of these shortcuts.
      </div>

      <div class="row q-col-gutter-sm justify-center">
        <div class="col-auto">
          <q-btn color="primary" unelevated to="/" label="Go to dashboard" no-caps />
        </div>
        <div class="col-auto">
          <q-btn color="secondary" outline to="/applications" label="Go to applications" no-caps />
        </div>
        <div class="col-auto">
          <q-btn color="indigo" flat to="/insights" label="View insights" no-caps />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.not-found-page {
  display: grid;
  place-items: center;
  min-height: 100%;
  background:
    radial-gradient(circle at 20% 0%, #eaf2ff 0%, transparent 45%),
    radial-gradient(circle at 80% 100%, #f1f5ff 0%, transparent 48%), #f8faff;
}

.not-found-wrap {
  max-width: 720px;
  text-align: center;
  background: white;
  border: 1px solid #dbe6ff;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(42, 80, 150, 0.12);
}

.not-found-code {
  font-size: clamp(72px, 12vw, 130px);
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: 2px;
  color: #304ffe;
  margin-bottom: 8px;
}
</style>
