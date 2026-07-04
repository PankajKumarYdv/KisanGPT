export class MarketValidator {
  /**
   * Validates mapped mandi market parameters.
   */
  static validateMappedRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Market record data is missing or not an object');
    }
    const requiredKeys = [
      'crop',
      'mandi',
      'district',
      'state',
      'arrivalQuantity',
      'minimumPrice',
      'maximumPrice',
      'modalPrice',
      'lastUpdated',
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Mapped market record is missing required attribute "${key}"`);
      }
    }
    if (typeof data.minimumPrice !== 'number' || data.minimumPrice < 0) {
      throw new Error('minimumPrice must be a non-negative number');
    }
    if (typeof data.maximumPrice !== 'number' || data.maximumPrice < 0) {
      throw new Error('maximumPrice must be a non-negative number');
    }
    if (typeof data.modalPrice !== 'number' || data.modalPrice < 0) {
      throw new Error('modalPrice must be a non-negative number');
    }
    return true;
  }

  /**
   * Checks list format.
   */
  static validateMappedRecords(records) {
    if (!Array.isArray(records)) {
      throw new Error('Market records list must be an array');
    }
    for (const record of records) {
      this.validateMappedRecord(record);
    }
    return true;
  }
}

export default MarketValidator;
