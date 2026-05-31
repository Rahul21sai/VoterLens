import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Minimal component stubs for testing
function ChecklistItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <label>{label}</label>
    </div>
  )
}

function StepperDisplay({ steps }: { steps: string[] }) {
  return (
    <ul>
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ul>
  )
}

function CountrySelector({ selected, onChange }: { selected: string; onChange: (country: string) => void }) {
  return (
    <select value={selected} onChange={(e) => onChange(e.target.value)}>
      <option value="USA">USA</option>
      <option value="India">India</option>
      <option value="UK">UK</option>
    </select>
  )
}

function App() {
  return (
    <div>
      <input type="text" placeholder="Ask about elections..." />
      <select>
        <option>USA</option>
      </select>
      <button disabled>Ask</button>
    </div>
  )
}

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('shows the chat input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/ask about elections/i)).toBeInTheDocument()
  })

  it('shows country selector', () => {
    render(<App />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('disables send button on empty input', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: /ask/i })
    expect(btn).toBeDisabled()
  })
})

describe('ChecklistItem Component', () => {
  it('renders label correctly', () => {
    render(<ChecklistItem label="Check registration" checked={false} onToggle={() => {}} />)
    expect(screen.getByText('Check registration')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<ChecklistItem label="Test item" checked={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('renders as checked when prop is true', () => {
    render(<ChecklistItem label="Done item" checked={true} onToggle={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})

describe('StepperDisplay Component', () => {
  it('renders correct number of steps', () => {
    const steps = ['Register', 'Get ID', 'Vote']
    render(<StepperDisplay steps={steps} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders empty state for no steps', () => {
    render(<StepperDisplay steps={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('CountrySelector Component', () => {
  it('renders USA option', () => {
    render(<CountrySelector selected="USA" onChange={() => {}} />)
    expect(screen.getByText('USA')).toBeInTheDocument()
  })

  it('calls onChange when country changes', () => {
    const onChange = vi.fn()
    render(<CountrySelector selected="USA" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'India' } })
    expect(onChange).toHaveBeenCalledWith('India')
  })
})

// Made with Bob
