# ENIGMA MENU COMPLETION STRATEGY
## Multilingual Menu System & EU Compliance

**Current Status:** 78% completion with critical gaps in German support, allergen coverage, and wine pairing system.

---

## 📊 CURRENT STATE ANALYSIS

### Database Infrastructure ✅
- **Menu Items**: 196 total items with complete ES/EN translation
- **Tables**: 30 restaurant schema tables with proper relationships
- **Wine System**: 8 wines with glass pricing, 9 wine pairings established
- **Allergen Framework**: EU-14 allergen structure in place

### Critical Gaps Identified 🚨
1. **German Language Support**: Missing `nameDe`, `descriptionDe`, `richDescriptionDe` fields
2. **Allergen Coverage**: Only ~18% of menu items have allergen data mapped
3. **Wine Pairings**: 9 of 196 potential relationships (4.6% coverage)
4. **Glass Pricing**: 82.6% of wines missing glassprice values

---

## 🎯 IMPLEMENTATION ROADMAP

### PHASE 1: Database Schema Enhancement (Week 1)

#### 1.1 German Language Support
```sql
-- Add German fields to menu_items table
ALTER TABLE restaurante.menu_items 
ADD COLUMN "nameDe" TEXT,
ADD COLUMN "descriptionDe" TEXT,
ADD COLUMN "richDescriptionDe" TEXT;

-- Add German support to menu_categories
ALTER TABLE restaurante.menu_categories 
ADD COLUMN "nameDe" TEXT,
ADD COLUMN "descriptionDe" TEXT;

-- Add German to allergens table
ALTER TABLE restaurante.allergens 
ADD COLUMN "nameDe" TEXT;
```

#### 1.2 Enhanced Wine Pairing Schema
```sql
-- Add confidence scoring and pairing types
ALTER TABLE restaurante.wine_pairings 
ADD COLUMN confidence_score NUMERIC(3,2) DEFAULT 1.0,
ADD COLUMN pairing_type VARCHAR(50) DEFAULT 'complementary',
ADD COLUMN season VARCHAR(20),
ADD COLUMN notes TEXT;

-- Create wine pairing recommendations view
CREATE OR REPLACE VIEW restaurante.wine_pairing_recommendations AS
SELECT 
    wp.*,
    f.name as food_name,
    w.name as wine_name,
    w.glassprice,
    w.price as bottle_price,
    w.alcoholcontent
FROM restaurante.wine_pairings wp
JOIN restaurante.menu_items f ON f.id = wp."foodItemId"
JOIN restaurante.menu_items w ON w.id = wp."wineItemId"
WHERE f."isAvailable" = true AND w."isAvailable" = true;
```

### PHASE 2: Content Migration & Completion (Week 2-3)

#### 2.1 German Translation Strategy
```typescript
// Translation service integration
const translateMenuItems = async () => {
  const items = await supabase
    .from('menu_items')
    .select('id, name, description, richDescription')
    .is('nameDe', null);
    
  for (const item of items.data) {
    const translations = await translateText({
      text: [item.name, item.description, item.richDescription],
      targetLang: 'de',
      context: 'restaurant_menu'
    });
    
    await supabase
      .from('menu_items')
      .update({
        nameDe: translations[0],
        descriptionDe: translations[1],
        richDescriptionDe: translations[2]
      })
      .eq('id', item.id);
  }
};
```

#### 2.2 Systematic Allergen Audit
```sql
-- Identify items missing allergen data
SELECT 
    mi.id,
    mi.name,
    mi."categoryId",
    COUNT(mia."allergenId") as allergen_count
FROM restaurante.menu_items mi
LEFT JOIN restaurante.menu_item_allergens mia ON mi.id = mia."menuItemId"
GROUP BY mi.id, mi.name, mi."categoryId"
HAVING COUNT(mia."allergenId") = 0
ORDER BY mi.name;
```

#### 2.3 Wine Pairing Algorithm
```typescript
// Intelligent pairing suggestions
const generateWinePairings = async () => {
  const foodItems = await supabase
    .from('menu_items')
    .select('*')
    .eq('categoryId', 'food_category_id');
    
  const wines = await supabase
    .from('menu_items')
    .select('*')
    .not('alcoholcontent', 'is', null);
    
  const pairings = [];
  
  for (const food of foodItems.data) {
    const suggestedWines = wines.data
      .filter(wine => isPairingCompatible(food, wine))
      .sort((a, b) => calculatePairingScore(food, b) - calculatePairingScore(food, a))
      .slice(0, 3);
      
    for (const wine of suggestedWines) {
      pairings.push({
        foodItemId: food.id,
        wineItemId: wine.id,
        confidence_score: calculatePairingScore(food, wine),
        pairing_type: determinePairingType(food, wine),
        notes: generatePairingNotes(food, wine)
      });
    }
  }
  
  await supabase.from('wine_pairings').insert(pairings);
};
```

### PHASE 3: Glass Pricing Optimization (Week 3)

#### 3.1 Pricing Strategy Implementation
```sql
-- Update glass pricing based on bottle price ratios
UPDATE restaurante.menu_items 
SET glassprice = ROUND(price * 0.18, 2)
WHERE alcoholcontent IS NOT NULL 
  AND glassprice IS NULL 
  AND price BETWEEN 20 AND 60;

-- Premium wines (higher ratio)
UPDATE restaurante.menu_items 
SET glassprice = ROUND(price * 0.22, 2)
WHERE alcoholcontent IS NOT NULL 
  AND glassprice IS NULL 
  AND price > 60;

-- House wines (lower ratio)
UPDATE restaurante.menu_items 
SET glassprice = ROUND(price * 0.15, 2)
WHERE alcoholcontent IS NOT NULL 
  AND glassprice IS NULL 
  AND price < 20;
```

### PHASE 4: EU Compliance Validation (Week 4)

#### 4.1 EU-14 Allergen Compliance Check
```typescript
// Compliance validation service
const validateEUCompliance = async () => {
  const requiredAllergens = [
    'gluten', 'crustaceans', 'eggs', 'fish',
    'peanuts', 'soybeans', 'milk', 'nuts',
    'celery', 'mustard', 'sesame', 'sulphites',
    'lupin', 'molluscs'
  ];
  
  const complianceReport = {
    totalItems: 0,
    itemsWithAllergens: 0,
    missingAllergenData: [],
    compliancePercentage: 0
  };
  
  const items = await supabase
    .from('menu_items')
    .select(`,
      menu_item_allergens(allergenId)
    `);
    
  complianceReport.totalItems = items.data.length;
  complianceReport.itemsWithAllergens = items.data
    .filter(item => item.menu_item_allergens.length > 0).length;
    
  complianceReport.compliancePercentage = 
    (complianceReport.itemsWithAllergens / complianceReport.totalItems) * 100;
    
  return complianceReport;
};
```

---

## 🏗️ COMPONENT DEVELOPMENT

### Enhanced Menu Display with German Support
```typescript
// /src/components/menu/MultilingualMenuDisplay.tsx
interface MenuDisplayProps {
  language: 'es' | 'en' | 'de';
  showAllergenInfo: boolean;
  showWinePairings: boolean;
}

const getLocalizedContent = (item: MenuItem, lang: string) => {
  switch(lang) {
    case 'de':
      return {
        name: item.nameDe || item.nameEn || item.name,
        description: item.descriptionDe || item.descriptionEn || item.description,
        richDescription: item.richDescriptionDe || item.richDescriptionEn || item.richDescription
      };
    case 'en':
      return {
        name: item.nameEn || item.name,
        description: item.descriptionEn || item.description,
        richDescription: item.richDescriptionEn || item.richDescription
      };
    default:
      return {
        name: item.name,
        description: item.description,
        richDescription: item.richDescription
      };
  }
};
```

### Wine Pairing Intelligence Component
```typescript
// /src/components/menu/WinePairingRecommendations.tsx
const WinePairingCard = ({ pairing }: { pairing: WinePairing }) => {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{pairing.wine_name}</h4>
            <p className="text-sm text-muted-foreground">{pairing.notes}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Copa: €{pairing.glassprice}
            </div>
            <div className="text-xs text-muted-foreground">
              Botella: €{pairing.bottle_price}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary">{pairing.pairing_type}</Badge>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${
                  i < pairing.confidence_score * 5 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 📈 SUCCESS METRICS

### Completion Targets
- **German Translation**: 100% coverage for all menu items
- **Allergen Compliance**: 95%+ coverage (EU requirement 80%+)
- **Wine Pairings**: 70%+ food items with at least 1 pairing
- **Glass Pricing**: 100% wines with glassprice values

### Performance KPIs
- Menu load time: <2s for 196 items
- Search response: <500ms
- Language switching: <300ms
- Allergen filtering: <200ms

---

## 🔧 IMPLEMENTATION COMMANDS

```bash
# Development workflow
npm run dev                    # Start development server
npm run db:studio             # Access database interface
npm run lint && npm run type-check  # Quality gates

# Database operations
npm run db:generate           # Update Prisma client
npm run db:push              # Deploy schema changes

# Testing
npm run test:menu            # Menu component tests
npm run test:allergens       # Allergen compliance tests
npm run test:wine-pairings   # Wine pairing algorithm tests
```

---

**Implementation Timeline:** 4 weeks
**Priority Level:** CRITICAL (EU compliance required)
**Resource Requirements:** 1 developer + 1 content translator + 1 wine expert
**Risk Mitigation:** Backup translation service, manual allergen review process