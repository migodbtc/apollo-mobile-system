import * as ol from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from "ol/View";
import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import type { PostverifiedReport, PreverifiedReport } from "./types/database";

export class ApolloMapHandler {
  private map: ol.Map;
  private overlays: ol.Overlay[] = [];
  private verified_reports: PostverifiedReport[] = [];
  private preverified_reports: PreverifiedReport[] = [];
  private onMarkerClick: (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => void;
  private showUnvalidated: boolean | undefined;

  constructor(
    parentElementId: string,
    userLocation: [number, number],
    onMarkerClick: (data: {
      report: PreverifiedReport;
      verificationStatus: PostverifiedReport | null;
    }) => void,
    showUnvalidated?: boolean
  ) {
    this.onMarkerClick = onMarkerClick;
    this.showUnvalidated = showUnvalidated;

    this.map = new ol.Map({
      target: parentElementId,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat(userLocation),
        zoom: 18,
      }),
    });
  }

  private renderOverlay(
    report: PreverifiedReport,
    isVerified: boolean,
    verification: PostverifiedReport | null
  ): Overlay {
    const minimum_px = 45;
    const markerSize = `${minimum_px}px`;
    const markerColor = isVerified ? "#2F855A" : "#C53030";
    const markerClass = isVerified ? "marker verified" : "marker unverified";
    const markerText = isVerified ? "!!" : "?";

    const marker = document.createElement("div");
    marker.className = markerClass;
    marker.setAttribute("key", `ReportOverlayID${report.PR_report_id}`);
    marker.innerHTML = markerText;

    marker.style.width = markerSize;
    marker.style.height = markerSize;
    marker.style.backgroundColor = markerColor;
    marker.style.borderRadius = "50%";
    marker.style.display = "flex";
    marker.style.alignItems = "center";
    marker.style.justifyContent = "center";
    marker.style.color = "#ffffff";
    marker.style.zIndex = "1000";
    marker.style.fontSize = "1.5rem";
    marker.style.cursor = "pointer";

    marker.setAttribute("data-toggle", "modal");
    marker.setAttribute("data-target", "#modal-render-marker");

    marker.addEventListener("click", () => {
      this.onMarkerClick({
        report,
        verificationStatus: verification,
      });
    });

    const overlay = new Overlay({
      position: fromLonLat([report.PR_longitude, report.PR_latitude]),
      positioning: "center-center",
      element: marker,
      stopEvent: false,
    });

    return overlay;
  }

  loadReports() {
    // console.log("Loading reports!");

    const verifiedMap = new Map(
      this.verified_reports.map((vReport) => [vReport.VR_report_id, vReport])
    );

    // console.log("Adding the overlays!");
    this.preverified_reports.forEach((report) => {
      const verification = verifiedMap.get(report.PR_report_id) || null;
      const isVerified = !!verification;

      if (this.showUnvalidated == false && isVerified) {
        const overlay = this.renderOverlay(report, isVerified, verification);

        // console.log(
        //   "Adding overlay at:",
        //   fromLonLat([report.PR_longitude, report.PR_latitude])
        // );
        this.map.addOverlay(overlay);
        this.overlays.push(overlay);
      } else if (this.showUnvalidated == true) {
        const overlay = this.renderOverlay(report, isVerified, verification);

        // console.log(
        //   "Adding overlay at:",
        //   fromLonLat([report.PR_longitude, report.PR_latitude])
        // );
        this.map.addOverlay(overlay);
        this.overlays.push(overlay);
      }
    });

    // console.log("Current overlays on map:", this.map.getOverlays());
  }

  loadReportsToday() {
    const verifiedMap = new Map(
      this.verified_reports.map((vReport) => [vReport.VR_report_id, vReport])
    );

    this.preverified_reports.forEach((report) => {
      const verification = verifiedMap.get(report.PR_report_id) || null;
      const isVerified = !!verification;

      if (this.showUnvalidated == false && isVerified) {
        const overlay = this.renderOverlay(report, isVerified, verification);

        this.map.addOverlay(overlay);
        this.overlays.push(overlay);
      } else if (this.showUnvalidated == true) {
        const overlay = this.renderOverlay(report, isVerified, verification);
        this.map.addOverlay(overlay);
        this.overlays.push(overlay);
      }
    });

    // console.log("Current overlays on map:", this.map.getOverlays());
  }

  updateAllReports(
    verified_reports: PostverifiedReport[],
    preverified_reports: PreverifiedReport[]
  ) {
    // console.log("Updating all reports!");
    this.clearOverlays();
    this.verified_reports = verified_reports;
    this.preverified_reports = preverified_reports;

    this.loadReports();
    // console.log("Done updating reports!");
    // console.log("Reports Overlays");
    // console.log(this.overlays);
  }

  updateAllReportsToday(
    verified_reports: PostverifiedReport[],
    preverified_reports: PreverifiedReport[]
  ) {
    function isTodayUTC(dateString: string) {
      const date = new Date(dateString);
      const now = new Date();
      return (
        date.getUTCFullYear() === now.getUTCFullYear() &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCDate() === now.getUTCDate()
      );
    }

    const todayPreverified = preverified_reports.filter((pre) =>
      isTodayUTC(pre.PR_timestamp)
    );
    const todayPostverified = verified_reports.filter((post) =>
      isTodayUTC(post.VR_verification_timestamp)
    );

    // console.log("Updating all reports (today only)!");
    // console.log("Preverified Reports (today):", todayPreverified);
    // console.log("Postverified Reports (today):", todayPostverified);

    this.clearOverlays();
    this.verified_reports = todayPostverified;
    this.preverified_reports = todayPreverified;

    this.loadReportsToday();
    // console.log("Done updating reports!");
    // console.log("Reports Overlays");
    // console.log(this.overlays);
  }

  clearOverlays() {
    // console.log("Clearing overlays!");
    this.overlays.forEach((overlay) => this.map.removeOverlay(overlay));
    this.overlays = [];
  }
}

export function initializeApolloMap(
  userLocation: [number, number],
  targetElementId: string,
  onMarkerClick: (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => void
): ApolloMapHandler {
  return new ApolloMapHandler(targetElementId, userLocation, onMarkerClick);
}
