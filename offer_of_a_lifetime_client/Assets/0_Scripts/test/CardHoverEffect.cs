using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class CardHoverEffect : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    public Image borderImage;

    private static readonly Color s_hoverColor = new Color(0.388f, 0.549f, 1f, 1f);
    private static readonly Color s_idleColor  = new Color(0.388f, 0.549f, 1f, 0f);

    void Start()
    {
        if (borderImage != null) borderImage.color = s_idleColor;
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        if (borderImage != null) borderImage.color = s_hoverColor;
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        if (borderImage != null) borderImage.color = s_idleColor;
    }
}
