(() => {
  'use strict';

  // v19 was the first pass at keeping Object Details, Transform, Visual,
  // Animation, and Audio independent. v20 now owns that job centrally.
  // This file stays as a compatibility stub because index.html may still load it.
  document.body.dataset.v19IndependentCardsRetired = 'true';
})();
