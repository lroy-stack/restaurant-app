/**
 * CONFIGURACIÓN PAGE
 * Sistema modular de configuración del restaurante
 */

import { ConfigHeader } from './components/config-header'
import { ConfigTabs, ConfigTabContent } from './components/config-tabs'
import { RestaurantInfoSection } from './components/sections/restaurant-info-section'
import { BusinessHoursSection } from './components/sections/business-hours-section'
import { AnnouncementsSection } from './components/sections/announcements-section'
import { EmailConfigSection } from './components/sections/email-config-section' // ✅ NEW

export default function ConfiguracionPage() {
  return (
    <div className="enigma-config-container space-y-6 py-6">
      <ConfigHeader />

      <ConfigTabs defaultSection="info">
        {/* TAB: Información General */}
        <ConfigTabContent value="info">
          <RestaurantInfoSection />
        </ConfigTabContent>

        {/* TAB: Horarios */}
        <ConfigTabContent value="horarios">
          <BusinessHoursSection />
        </ConfigTabContent>

        {/* TAB: Vacaciones - EN DESARROLLO */}
        <ConfigTabContent value="vacaciones">
          <div className="text-center py-12 text-muted-foreground">
            Sección de vacaciones en desarrollo
          </div>
        </ConfigTabContent>

        {/* TAB: Medios - EN DESARROLLO */}
        <ConfigTabContent value="medios">
          <div className="text-center py-12 text-muted-foreground">
            Biblioteca de medios en desarrollo
          </div>
        </ConfigTabContent>

        {/* TAB: Emails - ✅ IMPLEMENTED */}
        <ConfigTabContent value="emails">
          <EmailConfigSection />
        </ConfigTabContent>

        {/* TAB: Social - EN DESARROLLO */}
        <ConfigTabContent value="social">
          <div className="text-center py-12 text-muted-foreground">
            Redes sociales en desarrollo
          </div>
        </ConfigTabContent>

        {/* TAB: QR - EN DESARROLLO */}
        <ConfigTabContent value="qr">
          <div className="text-center py-12 text-muted-foreground">
            QR Analytics en desarrollo
          </div>
        </ConfigTabContent>

        {/* TAB: Legal - EN DESARROLLO */}
        <ConfigTabContent value="legal">
          <div className="text-center py-12 text-muted-foreground">
            Contenido legal en desarrollo
          </div>
        </ConfigTabContent>

        {/* TAB: Publicidad */}
        <ConfigTabContent value="publicidad">
          <AnnouncementsSection />
        </ConfigTabContent>
      </ConfigTabs>
    </div>
  )
}
