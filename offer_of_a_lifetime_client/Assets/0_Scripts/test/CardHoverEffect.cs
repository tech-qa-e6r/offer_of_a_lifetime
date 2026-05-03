using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class CardHoverEffect : MonoBehaviour
{
    public Image borderImage;

    private static readonly Color s_hoverColor = new Color(0.388f, 0.549f, 1f, 1f);
    private static readonly Color s_idleColor  = new Color(0.388f, 0.549f, 1f, 0f);

    void Start()
    {
        if (borderImage != null) borderImage.color = s_idleColor;

        var trigger = gameObject.GetComponent<EventTrigger>() ?? gameObject.AddComponent<EventTrigger>();

        var enter = new EventTrigger.Entry { eventID = EventTriggerType.PointerEnter };
        enter.callback.AddListener(_ => ShowBorder());
        trigger.triggers.Add(enter);

        var exit = new EventTrigger.Entry { eventID = EventTriggerType.PointerExit };
        exit.callback.AddListener(_ => HideBorder());
        trigger.triggers.Add(exit);
    }

    private void ShowBorder()
    {
        if (borderImage != null) borderImage.color = s_hoverColor;
    }

    private void HideBorder()
    {
        if (borderImage != null) borderImage.color = s_idleColor;
    }
}
