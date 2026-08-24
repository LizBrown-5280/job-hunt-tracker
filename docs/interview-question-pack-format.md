# Interview Question Pack Format

The MVP accepts one JSON object containing categories and questions. Category IDs must be unique, and every question must reference a category in the same pack or an existing category in the database.

```json
{
  "version": 1,
  "categories": [
    {
      "id": "technical-vue-3",
      "name": "Vue 3",
      "parentCategoryId": "system-technical"
    }
  ],
  "questions": [
    {
      "id": "vue-3-composition-api",
      "categoryId": "technical-vue-3",
      "difficulty": "Medium",
      "questionText": "What is the Composition API in Vue 3?",
      "modelAnswer": "It is a set of APIs for organizing component logic into composable functions.",
      "tips": ["Mention composables", "Mention setup"],
      "tags": ["composition-api", "composables"]
    }
  ]
}
```

The loader assigns `source: "imported"`, archive fields, and timestamps. It rejects invalid JSON, unsupported versions, missing category references, invalid difficulty values, and duplicate IDs without partially writing the pack.
