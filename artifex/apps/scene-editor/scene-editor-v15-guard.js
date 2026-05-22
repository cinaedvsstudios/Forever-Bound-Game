(() => {
  const coreFlag = 'artifexCoreMove' + 'Drag';
  const helperFlag = 'v15Centre' + 'Drag';
  if (document.body.dataset[coreFlag] === 'true') {
    document.body.dataset[helperFlag] = 'true';
  }
})();
