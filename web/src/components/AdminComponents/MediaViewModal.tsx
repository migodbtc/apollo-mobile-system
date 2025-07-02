import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

interface MediaViewModalProps {
  mediaId: number | null;
  showModal: boolean;
  handleClose: () => void;
}

const MediaViewModal: React.FC<MediaViewModalProps> = ({
  mediaId,
  showModal,
  handleClose,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const { mediaStorage, fetchMediaBlobById } = useAdminSQL();

  const associatedMedia = mediaStorage.find(
    (media) => media.MS_media_id === mediaId
  );

  useEffect(() => {
    let url: string | null = null;
    setMediaUrl(null);

    const fetchBlob = async () => {
      if (associatedMedia && associatedMedia.MS_media_id !== undefined) {
        const blob = await fetchMediaBlobById(associatedMedia.MS_media_id);
        console.log(
          `Fetching blob for media ID: ${associatedMedia.MS_media_id}`
        );
        console.log(`Associated media:`, associatedMedia);
        console.log(`Blob status: ${blob ? "fetched" : "not found"}`);
        if (blob) {
          url = URL.createObjectURL(blob);
          setMediaUrl(url);
        }
      }
    };

    fetchBlob();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [associatedMedia, fetchMediaBlobById]);

  if (!showModal) return null;

  return (
    <div
      className={`modal fade ${
        showModal
          ? "show d-flex justify-content-center align-items-center"
          : "d-none"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
        width: "100%",
        height: "100%",
        overflow: "auto",
        overflowY: "hidden",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-lg" style={{ overflowY: "hidden" }}>
        <div
          className="modal-content"
          style={{
            backgroundColor: "rgb(17, 22, 43)",
            borderRadius: "1rem",
            height: "80vh",
            aspectRatio: 9 / 16,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            className="modal-body d-flex p-0 flex-column w-100 h-100"
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              padding: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {mediaUrl ? (
              associatedMedia?.MS_file_type.startsWith("video/") ? (
                <video
                  src={mediaUrl}
                  controls
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#000",
                  }}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Media"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    background: "#000",
                  }}
                />
              )
            ) : (
              <p style={{ color: "#fff", margin: "auto" }}>Loading...</p>
            )}
          </div>
          <div
            className="d-flex justify-content-end align-items-center p-3 w-100"
            style={{
              border: "none",
              background: "transparent",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-secondary  ml-2"
              style={{ backgroundColor: "rgb(249, 115, 22)", border: 0 }}
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewModal;
