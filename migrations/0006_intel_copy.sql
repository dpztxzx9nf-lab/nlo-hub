update nlo_intel
set body = 'Join nlo.gg and you show up here. Names, last seen, and sightings come from who the world has actually hosted.'
where title = 'The ledger is live'
  and body ilike '%mock%';
