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
  const { fetchMediaBlobById } = useAdminSQL();

  useEffect(() => {
    let url: string | null = null;

    if (mediaId) {
      const fetchMedia = async () => {
        const blob = await fetchMediaBlobById(mediaId);
        url = URL.createObjectURL(blob);
        setMediaUrl(url);
      };

      fetchMedia();

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        setMediaUrl(null);
      };
    } else {
      setMediaUrl(null);
    }
  }, [mediaId, fetchMediaBlobById]);

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
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="modal-body d-flex justify-content-center align-items-center"
            style={{
              flex: 1,
              width: "100%",
              overflowY: "auto",
              padding: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {mediaUrl ? (
              mediaUrl.endsWith(".mp4") ? (
                <video
                  controls
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    maxHeight: 400,
                    objectFit: "contain",
                  }}
                >
                  <source src={mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={mediaUrl}
                  alt="Media"
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    maxHeight: 400,
                    objectFit: "contain",
                  }}
                />
              )
            ) : (
              <p style={{ color: "#fff" }}>Loading...</p>
            )}
          </div>
          <div
            className="modal-footer justify-content-end"
            style={{ border: "none" }}
          >
            <button
              type="button"
              className="btn btn-sm btn-secondary ml-2"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Exit Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewModal;
