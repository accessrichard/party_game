export default function StoryGame({ inputs }) {

    function getStory() {
        return inputs.map((x) => {
            if (x.type === "input") {
                
                return <span key={"span-" + x.id} className='bolder'>{x.value == '' ? '__________' : x.value}</span>
            }

            return x.value;

        });
        
    }

    return <span className="story display">{getStory()}</span>
}
