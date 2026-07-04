export class MarketMapper {
  /**
   * Transforms raw Agmarknet/Data.gov.in JSON records into KisanGPT property definitions.
   */
  static mapRecord(raw) {
    if (!raw) return null;

    // Normalizing attributes: min_price, max_price, modal_price may come as strings or numbers.
    // Clean string formats if there are commas.
    const cleanNum = (val) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      crop: (raw.commodity || '').toLowerCase().trim(),
      mandi: raw.market || raw.mandi || 'Local Mandi',
      district: (raw.district || '').toLowerCase().trim(),
      state: raw.state || '',
      arrivalQuantity: cleanNum(raw.arrival_quantity || raw.arrivals || raw.arrivalQuantity),
      minimumPrice: cleanNum(raw.min_price || raw.minimumPrice),
      maximumPrice: cleanNum(raw.max_price || raw.maximumPrice),
      modalPrice: cleanNum(raw.modal_price || raw.modalPrice || raw.price || raw.marketPrice),
      lastUpdated: raw.arrival_date || raw.lastUpdated || new Date().toISOString(),
    };
  }

  /**
   * Maps arrays of raw records.
   */
  static mapRecords(records) {
    if (!Array.isArray(records)) return [];
    return records.map((r) => this.mapRecord(r)).filter(Boolean);
  }
}

export default MarketMapper;
