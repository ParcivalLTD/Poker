fetch("/api/models")
  .then((response) => response.json())
  .then((models) => {
    models.forEach((model) => {
      initObject(model.name, model.path);
    });
  });
