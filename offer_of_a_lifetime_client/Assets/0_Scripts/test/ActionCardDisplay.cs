using UnityEngine;
using TMPro;

public class ActionCardDisplay : MonoBehaviour
{
    public CardData cardData;
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI descriptionText;
    public TextMeshProUGUI costText;

    void Start()
    {
        if (cardData == null) return;
        if (titleText != null) titleText.text = cardData.cardName;
        if (descriptionText != null) descriptionText.text = cardData.description;
        if (costText != null) costText.text = $"{cardData.moneyCost}$  /  {cardData.timeCostDays}d.";
    }
}
