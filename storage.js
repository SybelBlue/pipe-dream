SceneManager.cache = function() {
    const pipeline = lens(SceneManager, 'editor', 'pipeline');
    if (!pipeline) return;

    localStorage.setItem(SceneManager.level.number + '_pipeline', pipeline.cacheData);
}

SceneManager.retrieve = function() {
    return { pipeline: localStorage.getItem(SceneManager.level.number + '_pipeline') };
}

SceneManager.loadFromCache = function() {
    const pipeline = lens(SceneManager.retrieve(), 'pipeline');
    if (!pipeline) return;

    SceneManager.editor.pipeline.recieveCacheData(pipeline);
}