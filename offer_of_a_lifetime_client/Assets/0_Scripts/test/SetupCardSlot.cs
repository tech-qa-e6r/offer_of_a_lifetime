using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SetupCardSlot : MonoBehaviour
{
    [Header("Настройки слота")]
    public SetupCategory category;

    [Header("UI Элементы")]
    public GameObject cardBack;
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI descriptionText;
    public GameObject gradientStrip;

    private bool isRevealed = false;
    private SetupCardData _cardData;

    void Start()
    {
        titleText.gameObject.SetActive(false);
        descriptionText.gameObject.SetActive(false);
    }

    public void OnSlotClicked()
    {
        if (!isRevealed)
        {
            GameManager.Instance.DrawSetupCard(this);
            return;
        }
        if (_cardData != null && GameManager.Instance.currentState == GameManager.GameState.Playing)
        {
            string body = _cardData.backgroundStory;
            if (_cardData.category == SetupCategory.StartingResources)
                body += $"\n\n+{_cardData.startingMoney}$  |  +{_cardData.startingDays} дней";
            else if (_cardData.category == SetupCategory.BasicSkill)
                body += $"\n\nНавык: {_cardData.skillName}";
            else if (_cardData.category == SetupCategory.EmploymentStatus)
                body += $"\n\n{(_cardData.isCurrentlyEmployed ? "Есть работа" : "Безработный")}";
            GameManager.Instance.resultPopup.Show(_cardData.cardName, body);
        }
    }

    public void RevealCard(SetupCardData data)
    {
        _cardData = data;
        titleText.gameObject.SetActive(true);
        descriptionText.gameObject.SetActive(true);
        titleText.text = data.cardName;
        descriptionText.text = data.backgroundStory;
        cardBack.SetActive(false);
        if (gradientStrip != null) gradientStrip.SetActive(true);
        isRevealed = true;
    }

    public void MakeMiniCard()
    {
        if (descriptionText != null) descriptionText.gameObject.SetActive(false);
        if (gradientStrip != null) gradientStrip.SetActive(false);
    }
}
