import AboutSection from "./PublicComponents/AboutSection";
import ContactSection from "./PublicComponents/ContactSection";
import FeaturesSection from "./PublicComponents/FeaturesSection";
import FooterBar from "./FooterBar";
import HeroSection from "./PublicComponents/HeroSection";
import MissionSection from "./PublicComponents/MissionSection";

const PublicSegment = () => {
  return (
    <div id="publicSegment" className="container">
      {/* HEADER - JUMBOTRON/HERO */}
      <HeroSection />

      {/* MISSION */}
      <MissionSection />

      {/* FEATURES */}
      <FeaturesSection />

      {/* ABOUT */}
      <AboutSection />

      {/* CONTACT US */}
      <ContactSection />

      {/* FOOTER */}
      <FooterBar />
    </div>
  );
};

export default PublicSegment;
