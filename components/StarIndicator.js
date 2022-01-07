import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';

export function StarIndicator({ text, key = '0' }) {
  return (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip id={`tooltip-${key}`}>
          {text}
        </Tooltip>
      }
    >
      <div className="d-inline">
        <BsStarFill className="icon mx-2 text-warning" style={{ cursor: 'pointer' }} />
      </div>
    </OverlayTrigger>
  );
}