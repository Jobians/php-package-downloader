function isValidComposerJson(composerJson) {
  try {
    const json = JSON.parse(composerJson);
    if (json && typeof json === 'object' && json.require) {
      return null;
    }
    return 'Invalid JSON structure or missing "require" field';
  } catch (e) {
    return 'Invalid JSON format';
  }
}

module.exports = {
  isValidComposerJson
};