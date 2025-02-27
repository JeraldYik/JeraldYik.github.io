import 'react-vertical-timeline-component/style.min.css';

import { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';

import Badge from 'react-bootstrap/Badge';
import { MultiSelect } from 'react-multi-select-component';
import Education from '../data/education';
import Projects from '../data/projects';
import WorkExperiences from '../data/workExperiences';
import TimelineCategory from '../enums/timelineCategories';
import IEducation from '../interfaces/education';
import IProject from '../interfaces/projects';
import IDropdown from '../interfaces/shared/IDropdown';
import IWorkExperience from '../interfaces/workExperiences';
import { calculateDuration } from '../utils/duration';
import TimelineModal from './TimelineModal';

type TypeLabel = { type: TimelineCategory };
type WorkExperienceWithType = IWorkExperience & TypeLabel;
type ProjectWithType = IProject & TypeLabel;
type EducationWithType = IEducation & TypeLabel;
export type Data = WorkExperienceWithType | ProjectWithType | EducationWithType;

const Timeline: React.FC = () => {
  const WorkExperienceData: WorkExperienceWithType[] = WorkExperiences.map((data) => {
    return {
      ...data,
      type: TimelineCategory.workExperiences
    };
  });
  const ProjectsData: ProjectWithType[] = Projects.map((data) => {
    return {
      ...data,
      type: TimelineCategory.projects
    };
  });
  const EducationData: EducationWithType[] = Education.map((data) => {
    return {
      ...data,
      type: TimelineCategory.education
    };
  });
  const initialSelectedCategory: IDropdown = {
    label: TimelineCategory.workExperiences,
    value: 'workExperiences'
  };
  const [modalData, setModalData] = useState<Data | null>(null);
  const [detailsModalShow, setDetailsModalShow] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<IDropdown[]>([initialSelectedCategory]);
  const [sectionName, setSectionName] = useState<string>(TimelineCategory.workExperiences);
  const [timelineData, setTimelineData] = useState<Data[]>(WorkExperienceData);

  const formSectionName = (): string => {
    if (selectedCategories.length === 1) {
      return selectedCategories[0].label;
    }
    if (selectedCategories.length === Object.keys(TimelineCategory).length) {
      return 'All details 😄';
    }

    let s = '';
    for (let i = 0; i < selectedCategories.length - 1; i++) {
      s += selectedCategories[i].label;
      s += ' / ';
    }
    return s + selectedCategories[selectedCategories.length - 1].label;
  };

  useEffect(() => {
    setSectionName(formSectionName());
    // manually check
    const data = [];
    for (const type of selectedCategories) {
      switch (type.label) {
        case TimelineCategory.workExperiences:
          data.push(...WorkExperienceData);
          break;
        case TimelineCategory.projects:
          data.push(...ProjectsData);
          break;
        case TimelineCategory.education:
          data.push(...EducationData);
          break;
        default:
          break;
      }
    }
    setTimelineData(data);
  }, [selectedCategories]);

  const showDetailsModal = (data: Data): void => {
    setModalData(data);
    setDetailsModalShow(true);
  };

  const closeDetailsModal = (): void => {
    setDetailsModalShow(false);
  };

  const options: IDropdown[] = Object.entries(TimelineCategory).map(([key, value]) => {
    return {
      value: key,
      label: value
    } as IDropdown;
  });

  const dropdownOnChange = (e: IDropdown[]) => {
    // do not allow empty choice
    if (e[0]) setSelectedCategories(e);
  };

  const data = timelineData.slice().map((d, i) => {
    const tech =
      'technologies' in d &&
      d.technologies!.map((technology, i) => {
        return (
          <Badge className='experience-badge mr-2 mb-2' key={i}>
            {technology.label}
          </Badge>
        );
      });
    const startDate = d.startDate;
    const endDate = d.endDate ?? 'Present';
    return (
      <VerticalTimelineElement
        className='vertical-timeline-element--item vertical-timeline-element'
        date={`${startDate} - ${endDate} (${calculateDuration(startDate, endDate)})`}
        iconStyle={{
          background: '#AE944F', // circle colour
          color: '#fff', // lines colour
          textAlign: 'center'
        }}
        contentStyle={{
          cursor: 'pointer'
        }}
        icon={<i className={`${d.endDate ? 'fas fa-check' : 'fas fa-hourglass-start'} experience-icon`}></i>}
        key={i}
        onTimelineElementClick={() => showDetailsModal(d)}
      >
        <h3 className='vertical-timeline-element-title'>{'role' in d && !('name' in d) ? d.role : `${d.name}`}</h3>
        <h3 className='vertical-timeline-element-emoji'>{[...d.type.split(' ')].pop()}</h3>
        <h5 className='vertical-timeline-element-subtitle' style={{ textAlign: 'left' }}>
          {'organisation' in d ? `${d.organisation} - ${d.location}` : `${d.location}`}
        </h5>
        <div style={{ textAlign: 'left', marginTop: '15px' }}>{tech}</div>
      </VerticalTimelineElement>
    );
  });

  return (
    <section id='resume' className='pb-5'>
      <div className='col-md-12 mx-auto'>
        <div className='col-md-12'>
          <h1 className='section-title' style={{ color: 'black' }}>
            <span className='text-black' style={{ textAlign: 'center' }}>
              {`${sectionName} (${data.length})`}
            </span>
          </h1>
        </div>
      </div>
      <div className='col-md-11 mx-auto'>
        <MultiSelect
          options={options}
          value={selectedCategories}
          onChange={dropdownOnChange}
          disableSearch
          hasSelectAll={false}
          labelledBy='Select'
          className='dropdown-component'
        />
        <div className='col-md-9 mx-auto timeline-container'>
          <VerticalTimeline className='pb-2-important'>
            {data}
            <VerticalTimelineElement
              iconStyle={{
                background: '#AE944F', // circle colour
                color: '#fff', // lines colour
                textAlign: 'center'
              }}
              icon={<i className='fas fa-fist-raised mx-auto experience-icon'></i>}
              className='vertical-timeline-element'
            />
          </VerticalTimeline>
          {modalData && <TimelineModal show={detailsModalShow} onHide={closeDetailsModal} data={modalData} />}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
