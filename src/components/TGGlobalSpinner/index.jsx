import { range } from 'lodash'

export default function TGGlobalSpinner(props) {
  return (
    <div class={'tg-loading-container'}>
      <div class="tg-loading">
        <div>{range(5).map(() => <span />)}</div>
      </div>
      {props.message && (<h3>{props.message}</h3>)}
      {props.content && (<p>{props.content}</p>)}
    </div>
  )
}
