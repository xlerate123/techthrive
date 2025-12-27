class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    /**
     * Text search using MongoDB indexes
     *
     * - When "keyword" is present in the query string, use a $text query.
     * - This leverages the text index defined on the Product schema
     *   (name, description, category) for sub‑second search on large datasets.
     */
    if (this.queryStr.keyword) {
      const keyword = this.queryStr.keyword;

      this.query = this.query
        .find({ $text: { $search: keyword } })
        // Sort by text search relevance score when available
        .sort({ score: { $meta: "textScore" } })
        .select({ score: { $meta: "textScore" } });
    }

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    //   Removing some fields for category
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key) => delete queryCopy[key]);

    // Filter For Price and Rating

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
