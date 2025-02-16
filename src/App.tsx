import 'normalize.css'
import styled from 'styled-components'
import { BubblePlayground } from './components/BubblePlayground'
import { CartesianPlayground } from './components/CartesianPlayground'
import { Tabs, TabsProps } from 'antd'
import {
  AreaChartOutlined,
  DashboardOutlined,
  DotChartOutlined,
} from '@ant-design/icons'

const StyledTabs = styled(Tabs)`
  height: 100%;
  position: relative;
  &&& {
    .ant-tabs-content-holder {
      justify-items: stretch;
      align-items: stretch;
    }
    .ant-tabs-content {
      height: 100%;
    }
    .ant-tabs-nav {
      margin: 0;
    }
    .ant-tabs-nav-wrap {
      padding-left: 16px;
    }
  }
`

const items: TabsProps['items'] = [
  {
    key: 'Visx + Framer Cartesian',
    label: 'Cartesian',
    children: <CartesianPlayground />,
    icon: <AreaChartOutlined />,
    style: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
  },
  {
    key: 'Visx + Framer Bubble',
    label: 'Bubble Chart',
    children: <BubblePlayground />,
    icon: <DotChartOutlined />,
    style: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
  },
  {
    key: 'RD3 Dashboard',
    label: 'RD3 Dashboard',
    children: 'Dashboard',
    icon: <DashboardOutlined />,
    style: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
  },
]

function App() {
  return (
    <>
      <StyledTabs
        items={items}
        size="small"
        indicator={{ size: 100, align: 'center' }}
      />
    </>
  )
}

export default App
